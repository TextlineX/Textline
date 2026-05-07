import { useEffect, useRef, useState } from 'react'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'

import './AboutShowcaseModel.less'

type ThreeModule = typeof import('three')

type AboutShowcaseModelProps = {
  modelUrl?: string
  onCommand?: (command: AboutShowcaseCommand) => void
  screenTextureSource?: HTMLCanvasElement | null
}

type AboutShowcaseCommand = 'rotate-left' | 'rotate-right' | 'tilt-up' | 'tilt-down' | 'focus-screen' | 'btn-a' | 'btn-b'

type CommandHotspot = {
  mesh: InstanceType<ThreeModule['Mesh']>
  command: AboutShowcaseCommand
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
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

export function AboutShowcaseModel({
  modelUrl = '/models/gb.glb',
  onCommand,
  screenTextureSource,
}: AboutShowcaseModelProps) {
  const { scrollOffset, viewportHeight } = useAppShellScroll()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scrollOffsetRef = useRef(scrollOffset)
  const viewportHeightRef = useRef(viewportHeight)
  const onCommandRef = useRef(onCommand)
  const screenTextureSourceRef = useRef<HTMLCanvasElement | null>(screenTextureSource ?? null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    scrollOffsetRef.current = scrollOffset
  }, [scrollOffset])

  useEffect(() => {
    viewportHeightRef.current = viewportHeight
  }, [viewportHeight])

  useEffect(() => {
    onCommandRef.current = onCommand
  }, [onCommand])

  useEffect(() => {
    screenTextureSourceRef.current = screenTextureSource ?? null
  }, [screenTextureSource])

  useEffect(() => {
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
            material.needsUpdate = true
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
          const mesh = model.getObjectByName(name) as InstanceType<ThreeModule['Mesh']> | null
          if (!mesh || !mesh.isMesh) continue
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
          const mesh = model.getObjectByName(name) as InstanceType<ThreeModule['Mesh']> | null
          if (!mesh || !mesh.isMesh) continue
          commandHotspots.push({ mesh, command })
        }

        const screenGroup = model.getObjectByName('screen')
        if (screenGroup && screenGroup.isMesh) {
          screenMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
            toneMapped: false,
            transparent: false,
          })
          screenGroup.material = screenMaterial
          screenGroup.renderOrder = 999
          screenMesh = screenGroup as InstanceType<ThreeModule['Mesh']>
          commandHotspots.push({ mesh: screenGroup as InstanceType<ThreeModule['Mesh']>, command: 'focus-screen' })
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
              side: THREE.DoubleSide,
              depthTest: false,
              depthWrite: false,
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
          camera.position.z = Math.max(verticalDistance, horizontalDistance) * 1.46 + framedSize.z * 0.38
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
            return
          }

          const rect = canvas.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
          pointerNdc.set(x, y)
          raycaster.setFromCamera(pointerNdc, camera)
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

        const tick = (time: number) => {
          if (!disposed && renderer && scene && camera && rootGroup && loadedModel) {
            const currentViewportHeight = viewportHeightRef.current
            const currentScrollOffset = scrollOffsetRef.current
            const sectionProgress = currentViewportHeight > 0 ? currentScrollOffset / currentViewportHeight - 1 : 0
            const active = clamp((sectionProgress + 1.1) / 1.2, 0, 1)

            rootGroup.rotation.y = Math.PI + Math.sin(time * 0.00045) * 0.05
            rootGroup.rotation.x = 0.32 - active * 0.06
            rootGroup.position.y = framedSize.y * 0.24 + Math.sin(time * 0.0008) * 0.02
            rootGroup.scale.setScalar(0.995 + active * 0.02)

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
      loadedModel?.traverse((object) => {
        const mesh = object as InstanceType<ThreeModule['Mesh']>
        if (!mesh.isMesh) {
          return
        }

        mesh.geometry.dispose()
        const material = mesh.material
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
  }, [modelUrl])

  return (
    <div className={`about-showcase-model${ready ? ' about-showcase-model--ready' : ''}${failed ? ' about-showcase-model--failed' : ''}`}>
      <canvas ref={canvasRef} className="about-showcase-model__canvas" aria-hidden="true" />
      {!ready ? (
        <div className="about-showcase-model__overlay" aria-hidden="true">
          <div className="about-showcase-model__overlay-title">
            {failed ? 'MODEL LOAD FAILED' : 'LOADING MODEL'}
          </div>
          <div className="about-showcase-model__overlay-copy">
            {failed ? '请检查 gb.glb 是否存在。' : '正在加载 gb.glb。'}
          </div>
        </div>
      ) : null}
    </div>
  )
}
