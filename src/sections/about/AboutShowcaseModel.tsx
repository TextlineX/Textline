import { useEffect, useRef, useState } from 'react'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'

import './AboutShowcaseModel.less'

type ThreeModule = typeof import('three')

type AboutShowcaseModelProps = {
  modelUrl?: string
  onCommand?: (command: AboutShowcaseCommand) => void
  screenTextureSource?: HTMLCanvasElement | null
  scrollDirection?: 1 | -1
  enabled?: boolean
}

type AboutShowcaseCommand = 'rotate-left' | 'rotate-right' | 'tilt-up' | 'tilt-down' | 'focus-screen' | 'btn-a' | 'btn-b'

type CommandHotspot = {
  mesh: InstanceType<ThreeModule['Mesh']>
  command: AboutShowcaseCommand
}

function createInvisibleHitMaterial(THREE: ThreeModule) {
  return new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    visible: true,
  })
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export function AboutShowcaseModel({
  modelUrl = '/models/GB.glb',
  onCommand,
  screenTextureSource,
  scrollDirection,
  enabled = true,
}: AboutShowcaseModelProps) {
  const { scrollOffset, sectionStep } = useAppShellScroll()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scrollOffsetRef = useRef(scrollOffset)
  const onCommandRef = useRef(onCommand)
  const screenTextureSourceRef = useRef<HTMLCanvasElement | null>(screenTextureSource ?? null)
  const scrollDirectionRef = useRef(scrollDirection ?? 1)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const modelFileName = modelUrl.split('/').filter(Boolean).pop() ?? 'model.glb'

  useEffect(() => {
    scrollOffsetRef.current = scrollOffset
  }, [scrollOffset])

  useEffect(() => {
    onCommandRef.current = onCommand
  }, [onCommand])

  useEffect(() => {
    screenTextureSourceRef.current = screenTextureSource ?? null
  }, [screenTextureSource])

  useEffect(() => {
    if (scrollDirection !== undefined) {
      scrollDirectionRef.current = scrollDirection
    }
  }, [scrollDirection])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    let disposed = false
    let frameId = 0
    let observer: ResizeObserver | null = null
    let renderer: InstanceType<ThreeModule['WebGLRenderer']> | null = null
    let scene: InstanceType<ThreeModule['Scene']> | null = null
    let camera: InstanceType<ThreeModule['PerspectiveCamera']> | null = null
    let rootGroup: InstanceType<ThreeModule['Group']> | null = null
    let loadedModel: InstanceType<ThreeModule['Object3D']> | null = null
    let threeModule: ThreeModule | null = null
    let screenMesh: InstanceType<ThreeModule['Mesh']> | null = null
    let screenMaterial: InstanceType<ThreeModule['MeshBasicMaterial']> | null = null
    let screenTexture: InstanceType<ThreeModule['CanvasTexture']> | null = null
    let raycaster: InstanceType<ThreeModule['Raycaster']> | null = null
    let pointerNdc: InstanceType<ThreeModule['Vector2']> | null = null
    const commandHotspots: CommandHotspot[] = []
    let handlePointerMove: ((event: PointerEvent) => void) | null = null
    let handlePointerDown: ((event: PointerEvent) => void) | null = null

    void (async () => {
      try {
        const THREE = await import('three')
        threeModule = THREE
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')

        if (disposed || !canvasRef.current) {
          return
        }

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 3))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.setClearColor(0x000000, 0)

        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
        camera.position.set(0, 0, 6)
        raycaster = new THREE.Raycaster()
        pointerNdc = new THREE.Vector2()

        scene.add(new THREE.AmbientLight(0xffffff, 2.0))
        const key = new THREE.DirectionalLight(0xffffff, 2.2)
        key.position.set(4, 6, 8)
        scene.add(key)

        const fill = new THREE.DirectionalLight(0xdfe7f2, 0.9)
        fill.position.set(-4, 2, 5)
        scene.add(fill)

        rootGroup = new THREE.Group()
        scene.add(rootGroup)

        const loader = new GLTFLoader()
        const gltf = await loader.loadAsync(modelUrl)
        if (disposed || !rootGroup) {
          return
        }

        const model = gltf.scene
        model.traverse((object) => {
          const mesh = object as InstanceType<ThreeModule['Mesh']>
          if (!('isMesh' in mesh) || !mesh.isMesh) {
            return
          }

          mesh.castShadow = false
          mesh.receiveShadow = false

          const material = mesh.material
          if (!Array.isArray(material)) {
            material.transparent = false
            material.side = THREE.FrontSide
            material.needsUpdate = true
          } else {
            for (const entry of material) {
              entry.transparent = false
              entry.side = THREE.FrontSide
              entry.needsUpdate = true
            }
          }
        })

        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        model.position.sub(center)
        const maxSize = Math.max(size.x, size.y, size.z, 0.0001)
        const targetSize = 2.45
        const scale = targetSize / maxSize
        const displayScale = scale * 8.5
        model.scale.setScalar(displayScale)
        model.rotation.set(0, -(Math.PI / 2), 0)
        model.updateWorldMatrix(true, true)

        const framedBox = new THREE.Box3().setFromObject(model)
        const framedCenter = framedBox.getCenter(new THREE.Vector3())
        const framedSize = framedBox.getSize(new THREE.Vector3())
        model.position.sub(framedCenter)
        model.position.y += framedSize.y * 0.3
        model.updateWorldMatrix(true, true)

        rootGroup.add(model)
        loadedModel = model

        const hitMaterial = createInvisibleHitMaterial(THREE)

        // Direction anchors are invisible hit meshes — replace material for raycasting
        const invisibleAnchors: Array<{ name: string; command: AboutShowcaseCommand }> = [
          { name: 'up_anchor', command: 'tilt-up' },
          { name: 'down_anchor', command: 'tilt-down' },
          { name: 'left_anchor', command: 'rotate-left' },
          { name: 'right_anchor', command: 'rotate-right' },
        ]
        for (const { name, command } of invisibleAnchors) {
          const mesh = model.getObjectByName(name)
          if (!(mesh instanceof THREE.Mesh)) continue
          mesh.material = hitMaterial.clone()
          mesh.renderOrder = 1000
          commandHotspots.push({ mesh, command })
        }

        // A and B are visible button meshes — keep original material, just register for raycasting
        const visibleButtons: Array<{ name: string; command: AboutShowcaseCommand }> = [
          { name: 'A', command: 'btn-a' },
          { name: 'B', command: 'btn-b' },
        ]
        for (const { name, command } of visibleButtons) {
          const mesh = model.getObjectByName(name)
          if (!(mesh instanceof THREE.Mesh)) continue
          commandHotspots.push({ mesh, command })
        }

        const screenGroup = model.getObjectByName('screen')
        if (screenGroup instanceof THREE.Mesh) {
          screenMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.FrontSide,
            depthTest: true,
            depthWrite: true,
            toneMapped: false,
            transparent: false,
          })
          screenGroup.material = screenMaterial
          screenGroup.renderOrder = 999
          screenMesh = screenGroup
          commandHotspots.push({ mesh: screenGroup, command: 'focus-screen' })
        }

        const syncScreenTexture = () => {
          if (!screenMesh) {
            return
          }

          const source = screenTextureSourceRef.current
          if (!source) {
            return
          }

          if (screenTexture?.image === source) {
            screenTexture.needsUpdate = true
            return
          }

          screenTexture?.dispose()
          screenTexture = new THREE.CanvasTexture(source)
          screenTexture.colorSpace = THREE.SRGBColorSpace
          screenTexture.flipY = false
          screenTexture.minFilter = THREE.LinearFilter
          screenTexture.magFilter = THREE.LinearFilter
          screenTexture.generateMipmaps = false
          screenTexture.needsUpdate = true

          if (screenMaterial) {
            screenMaterial.map = screenTexture
            screenMaterial.color.set(0xffffff)
            screenMaterial.depthTest = false
            screenMaterial.depthWrite = false
            screenMaterial.toneMapped = false
            screenMaterial.needsUpdate = true
          } else {
            const material = new THREE.MeshBasicMaterial({
              map: screenTexture,
              color: 0xffffff,
              side: THREE.FrontSide,
              depthTest: true,
              depthWrite: true,
              toneMapped: false,
              transparent: false,
            })
            screenMesh.material = material
            screenMesh.renderOrder = 999
            screenMaterial = material
          }
        }

        const fitCamera = () => {
          if (!camera || !loadedModel) {
            return
          }

          const rect = canvas.getBoundingClientRect()
          const aspect = Math.max(0.01, rect.width / Math.max(rect.height, 1))
          const fov = THREE.MathUtils.degToRad(camera.fov)
          const projectedHeight = framedSize.y / 2
          const projectedWidth = framedSize.x / 2
          const verticalDistance = projectedHeight / Math.tan(fov / 2)
          const horizontalDistance = projectedWidth / (Math.tan(fov / 2) * aspect)
          camera.position.z = Math.max(verticalDistance, horizontalDistance) * 1.65 + framedSize.z * 0.45
          camera.position.y = framedSize.y * 0.22
          camera.lookAt(0, framedSize.y * 0.12, 0)
        }

        fitCamera()
        setReady(true)

        const resize = () => {
          if (!renderer || !camera) {
            return
          }

          const rect = canvas.getBoundingClientRect()
          const width = Math.max(1, rect.width)
          const height = Math.max(1, rect.height)
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          fitCamera()
        }

        observer = new ResizeObserver(resize)
        observer.observe(canvas)
        resize()

        handlePointerMove = (event: PointerEvent) => {
          if (!camera || !raycaster || !pointerNdc || commandHotspots.length === 0) {
            canvas.style.cursor = 'default'
            return
          }

          const rect = canvas.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
          pointerNdc.set(x, y)
          raycaster.setFromCamera(pointerNdc, camera)
          const hits = raycaster.intersectObjects(commandHotspots.map((entry) => entry.mesh), false)
          canvas.style.cursor = hits.length > 0 ? 'pointer' : 'crosshair'
        }

        handlePointerDown = (event: PointerEvent) => {
          if (!camera || !raycaster || !pointerNdc || commandHotspots.length === 0) {
            return
          }

          const rect = canvas.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
          pointerNdc.set(x, y)
          raycaster.setFromCamera(pointerNdc, camera)
          const hits = raycaster.intersectObjects(commandHotspots.map((entry) => entry.mesh), false)
          const hitMesh = hits[0]?.object as InstanceType<ThreeModule['Mesh']> | undefined
          const target = hitMesh ? commandHotspots.find((entry) => entry.mesh === hitMesh) ?? null : null

          if (target) {
            onCommandRef.current?.(target.command)
            window.dispatchEvent(
              new CustomEvent('about-showcase-command', {
                detail: { command: target.command },
              }),
            )
          }
        }

        canvas.addEventListener('pointermove', handlePointerMove)
        canvas.addEventListener('pointerdown', handlePointerDown)

        const tick = (_time: number) => {
          if (!disposed && renderer && scene && camera && rootGroup && loadedModel) {
            const currentScrollOffset = scrollOffsetRef.current
            const sectionProgress = sectionStep > 0 ? currentScrollOffset / sectionStep - 1 : 0
            const visibility = sectionProgress <= -1.1
              ? 0
              : sectionProgress < 0
                ? smoothstep(-1.1, 0, sectionProgress)
                : sectionProgress <= 0.85
                  ? 1
                  : sectionProgress < 1.55
                    ? 1 - smoothstep(0.85, 1.55, sectionProgress)
                    : 0

            canvas.style.opacity = `${visibility.toFixed(3)}`
            canvas.style.pointerEvents = visibility > 0.02 ? 'auto' : 'none'
            if (visibility <= 0) {
              renderer.render(scene, camera)
              frameId = window.requestAnimationFrame(tick)
              return
            }

            // Animation keyframes driven by scrollProgress
            // Each phase maps to a defined transform; transitions are smoothstep-interpolated

            type Keyframe = {
              t: number       // 0..1 scroll progress within the current phase
              y: number        // rotation.y
              x: number        // rotation.x
              z: number        // rotation.z
              sy: number       // scale
              py: number       // position.y (relative to center)
              px: number       // position.x
            }

            const phases: Array<{ range: [number, number]; frames: Keyframe[] }> = [
              // Phase 0: Enter — from back, spin clockwise (positive Y) to front
              {
                range: [-1.1, 0.0] as [number, number],
                frames: [
                  { t: 0,   y: Math.PI * 2.0,  x: -0.6,  z: -0.5, sy: 0.18, py: 0.35, px: 0 },
                  { t: 0.15,y: Math.PI * 1.3,  x: 0.5,   z: 0.6,  sy: 0.45, py: 0.32, px: 0 },
                  { t: 0.35,y: Math.PI * 0.8,  x: -0.4,  z: -0.4, sy: 0.70, py: 0.30, px: 0 },
                  { t: 0.55,y: Math.PI * 0.4,  x: 0.35,  z: 0.25, sy: 0.85, py: 0.27, px: 0 },
                  { t: 0.75,y: Math.PI * 0.15, x: 0.2,   z: 0.1,  sy: 0.96, py: 0.25, px: 0 },
                  { t: 1.0, y: Math.PI,        x: 0.32,  z: 0,    sy: 1.02, py: 0.24, px: 0 },
                ],
              },
              // Phase 1: Idle — gentle micro breathing (raw 0 → 6+)
              {
                range: [0.0, 7.0] as [number, number],
                frames: [
                  { t: 0,   y: Math.PI,        x: 0.32,  z: 0,     sy: 1.02, py: 0.24, px: 0 },
                  { t: 0.15,y: Math.PI + 0.06, x: 0.35,  z: 0.01,  sy: 1.05, py: 0.28, px: 0 },
                  { t: 0.3, y: Math.PI,        x: 0.29,  z: -0.01, sy: 0.99, py: 0.20, px: 0 },
                  { t: 0.45,y: Math.PI - 0.06, x: 0.35,  z: 0.01,  sy: 1.05, py: 0.28, px: 0 },
                  { t: 0.6, y: Math.PI,        x: 0.32,  z: 0,     sy: 1.02, py: 0.24, px: 0 },
                  { t: 0.75,y: Math.PI + 0.06, x: 0.35,  z: 0.01,  sy: 1.05, py: 0.28, px: 0 },
                  { t: 0.9, y: Math.PI,        x: 0.29,  z: -0.01, sy: 0.99, py: 0.20, px: 0 },
                  { t: 1.0, y: Math.PI - 0.06, x: 0.35,  z: 0.01,  sy: 1.05, py: 0.28, px: 0 },
                ],
              },
              // Phase 2: Exit — spin to show back, then disappear
              {
                range: [-2.2, -1.1] as [number, number],
                frames: [
                  { t: 0,   y: Math.PI,        x: 0.32,  z: 0,    sy: 1.02, py: 0.24, px: 0 },
                  { t: 0.3, y: Math.PI * 0.5,  x: 0.25,  z: 0.05, sy: 1.08, py: 0.28, px: 0 },
                  { t: 0.65,y: Math.PI * 0,    x: 0.15,  z: 0.1,  sy: 1.05, py: 0.32, px: 0 },
                  { t: 1.0, y: Math.PI * -0.5, x: 0.1,   z: 0.05, sy: 0.5,  py: 0.4,  px: 0 },
                ],
              },
            ]

            let phase: typeof phases[0]
            let phaseT = 0

            if (sectionProgress < 0) {
              // Enter phase while the section is sliding into view
              phase = phases[0]
              phaseT = smoothstep(-1.1, 0, sectionProgress)
            } else if (sectionProgress <= 0.85) {
              // Idle phase while the section is centered
              phase = phases[1]
              const idleDrift = _time * 0.00018 + sectionProgress * 0.6
              phaseT = idleDrift - Math.floor(idleDrift)
            } else {
              // Exit phase while the section is leaving view
              phase = phases[2]
              phaseT = smoothstep(0.85, 1.55, sectionProgress)
            }

            const frames = phase.frames
            // Find surrounding keyframes
            let lo = 0
            for (let i = 0; i < frames.length - 1; i++) {
              if (phaseT >= frames[i].t && phaseT <= frames[i + 1].t) {
                lo = i
                break
              }
            }
            const hi = lo + 1
            const span = frames[hi].t - frames[lo].t
            const localT = span > 0 ? (phaseT - frames[lo].t) / span : 0
            // smoothstep ease
            const ease = localT * localT * (3 - 2 * localT)

            const lerp = (a: number, b: number) => a + (b - a) * ease

            rootGroup.rotation.y = lerp(frames[lo].y, frames[hi].y)
            rootGroup.rotation.x = lerp(frames[lo].x, frames[hi].x)
            rootGroup.rotation.z = lerp(frames[lo].z, frames[hi].z)
            rootGroup.scale.setScalar(lerp(frames[lo].sy, frames[hi].sy))
            rootGroup.position.y = lerp(frames[lo].py, frames[hi].py) * framedSize.y
            rootGroup.position.x = lerp(frames[lo].px, frames[hi].px) * framedSize.x

            syncScreenTexture()
            if (screenTexture) {
              screenTexture.needsUpdate = true
            }
            renderer.render(scene, camera)
          }

          frameId = window.requestAnimationFrame(tick)
        }

        frameId = window.requestAnimationFrame(tick)
      } catch {
        if (!disposed) {
          setFailed(true)
        }
      }
    })()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      observer?.disconnect()
      if (canvasRef.current && handlePointerMove && handlePointerDown) {
        canvasRef.current.removeEventListener('pointermove', handlePointerMove)
        canvasRef.current.removeEventListener('pointerdown', handlePointerDown)
      }
      const THREE = threeModule
      if (!THREE) {
        return
      }
      loadedModel?.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) {
          return
        }

        object.geometry.dispose()
        const material = object.material
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose())
        } else {
          material.dispose()
        }
      })
      commandHotspots.splice(0, commandHotspots.length)
      screenTexture?.dispose()
      renderer?.dispose()
    }
  }, [enabled, modelUrl, sectionStep])

  return (
    <div className={`about-showcase-model${ready ? ' about-showcase-model--ready' : ''}${failed ? ' about-showcase-model--failed' : ''}`}>
      <canvas ref={canvasRef} className="about-showcase-model__canvas" aria-hidden="true" />
      {!ready ? (
        <div className="about-showcase-model__overlay" aria-hidden="true">
          <div className="about-showcase-model__overlay-title">
            {failed ? 'MODEL LOAD FAILED' : 'LOADING MODEL'}
          </div>
          <div className="about-showcase-model__overlay-copy">
            {failed ? `请检查 ${modelFileName} 是否存在。` : `正在加载 ${modelFileName}。`}
          </div>
        </div>
      ) : null}
    </div>
  )
}
