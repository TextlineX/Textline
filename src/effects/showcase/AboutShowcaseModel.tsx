import { useEffect, useRef, useState } from 'react'

import './AboutShowcaseModel.less'

type ThreeModule = typeof import('three')

type AboutShowcaseModelProps = {
  modelUrl?: string
}

type PointerState = {
  x: number
  y: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function AboutShowcaseModel({ modelUrl = '/models/about-showcase.glb' }: AboutShowcaseModelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    let disposed = false
    let frameId = 0
    let renderer: InstanceType<ThreeModule['WebGLRenderer']> | null = null
    let scene: InstanceType<ThreeModule['Scene']> | null = null
    let camera: InstanceType<ThreeModule['PerspectiveCamera']> | null = null
    let rootGroup: InstanceType<ThreeModule['Group']> | null = null
    let loadedModel: InstanceType<ThreeModule['Object3D']> | null = null
    let observer: ResizeObserver | null = null
    const pointer: PointerState = { x: 0, y: 0 }
    const targetPointer: PointerState = { x: 0, y: 0 }

    const load = async () => {
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.05
        renderer.setClearColor(0x000000, 0)

        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
        camera.position.set(0, 0.2, 6.3)

        const ambient = new THREE.AmbientLight(0xffffff, 1.35)
        const key = new THREE.DirectionalLight(0xffe2d0, 2.2)
        key.position.set(3.2, 4.8, 5.6)
        const rim = new THREE.DirectionalLight(0x65c4c8, 0.9)
        rim.position.set(-3.8, 1.2, -2.2)
        const glow = new THREE.PointLight(0xe53d3d, 1.5, 18)
        glow.position.set(0.8, 0.4, 3.4)

        scene.add(ambient, key, rim, glow)

        rootGroup = new THREE.Group()
        rootGroup.rotation.x = 0.08
        rootGroup.rotation.y = -0.35
        rootGroup.rotation.z = -0.02
        scene.add(rootGroup)

        const loader = new GLTFLoader()
        const gltf = await loader.loadAsync(modelUrl)

        if (disposed || !rootGroup) {
          return
        }

        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z) || 1
        const targetSize = 4.6
        const scale = targetSize / maxDim

        model.position.sub(center)
        model.scale.setScalar(scale)
        rootGroup.add(model)
        loadedModel = model

        model.traverse((object) => {
          const mesh = object as InstanceType<ThreeModule['Mesh']>
          if (!('isMesh' in mesh) || !mesh.isMesh) {
            return
          }

          mesh.castShadow = false
          mesh.receiveShadow = false

          const name = `${mesh.name ?? ''} ${mesh.parent?.name ?? ''}`.toLowerCase()
          if (/screen/.test(name)) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x101010,
              roughness: 0.25,
              metalness: 0.04,
              emissive: new THREE.Color(0x5b1f23),
              emissiveIntensity: 0.16,
            })
            return
          }

          if (/btn|button|arrow|left|right|up|down|top/.test(name)) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x1d1d1f,
              roughness: 0.32,
              metalness: 0.12,
              emissive: new THREE.Color(0x101010),
              emissiveIntensity: 0.04,
            })
            return
          }

          if (/body|frame|shell/.test(name)) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x111214,
              roughness: 0.82,
              metalness: 0.08,
              emissive: new THREE.Color(0x050505),
              emissiveIntensity: 0.02,
            })
            return
          }

          mesh.material = new THREE.MeshStandardMaterial({
            color: 0x151515,
            roughness: 0.62,
            metalness: 0.08,
          })
        })

        setReady(true)
      } catch {
        if (!disposed) {
          setFailed(true)
        }
      }
    }

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
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      targetPointer.x = clamp(x, -1, 1)
      targetPointer.y = clamp(y, -1, 1)
    }

    const handlePointerLeave = () => {
      targetPointer.x = 0
      targetPointer.y = 0
    }

    void load()

    observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerleave', handlePointerLeave)

    const tick = (time: number) => {
      if (!disposed && renderer && scene && camera && rootGroup) {
        pointer.x += (targetPointer.x - pointer.x) * 0.08
        pointer.y += (targetPointer.y - pointer.y) * 0.08

        rootGroup.rotation.y = -0.38 + pointer.x * 0.34 + Math.sin(time * 0.00032) * 0.045
        rootGroup.rotation.x = 0.1 - pointer.y * 0.16 + Math.sin(time * 0.00023) * 0.02
        rootGroup.position.y = Math.sin(time * 0.0008) * 0.05

        renderer.render(scene, camera)
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      observer?.disconnect()
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerleave', handlePointerLeave)
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
            {failed ? '请检查 glb 文件路径或模型结构。' : '正在加载 About 展示装置。'}
          </div>
        </div>
      ) : null}
    </div>
  )
}
