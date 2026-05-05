import { useEffect, useRef, useState } from 'react'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'
import { AboutShowcaseDom } from './AboutShowcaseDom'

import './AboutShowcaseModel.less'

type ThreeModule = typeof import('three')

type AboutShowcaseModelProps = {
  modelUrl?: string
  onCommand?: (command: AboutShowcaseCommand) => void
  activeCommand?: string | null
}

type PointerState = {
  x: number
  y: number
}

export type AboutShowcaseCommand =
  | 'rotate-left'
  | 'rotate-right'
  | 'tilt-up'
  | 'tilt-down'
  | 'reset-view'
  | 'focus-screen'

type ButtonTarget = {
  hitMesh: InstanceType<ThreeModule['Mesh']>
  visualMesh: InstanceType<ThreeModule['Mesh']>
  command: AboutShowcaseCommand
  baseScale: InstanceType<ThreeModule['Vector3']>
  baseEmissiveIntensity: number
}

type ButtonHotspot = {
  target: ButtonTarget
  element: HTMLButtonElement
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) {
    return value >= edge1 ? 1 : 0
  }

  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return x * x * (3 - 2 * x)
}

function createComicGradientMap(THREE: ThreeModule) {
  const gradientCanvas = document.createElement('canvas')
  gradientCanvas.width = 16
  gradientCanvas.height = 1
  const context = gradientCanvas.getContext('2d')

  if (!context) {
    const texture = new THREE.CanvasTexture(gradientCanvas)
    texture.needsUpdate = true
    return texture
  }

  const bands = ['#121212', '#3f3f46', '#9ca3af', '#e5e7eb']
  const bandWidth = gradientCanvas.width / bands.length

  bands.forEach((color, index) => {
    context.fillStyle = color
    context.fillRect(index * bandWidth, 0, bandWidth, 1)
  })

  const texture = new THREE.CanvasTexture(gradientCanvas)
  texture.needsUpdate = true
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createButtonShellMaterial(THREE: ThreeModule) {
  return new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.01,
    depthWrite: false,
    side: THREE.DoubleSide,
    color: new THREE.Color(0xffffff),
  })
}

function createHalftoneTexture(THREE: ThreeModule) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')

  if (!context) {
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#111111'

  const step = 14
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const radius = ((x / step + y / step) % 2 === 0 ? 1.5 : 0.85)
      context.beginPath()
      context.arc(x + step / 2, y + step / 2, radius, 0, Math.PI * 2)
      context.fill()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  return texture
}

function drawButtonMark(context: CanvasRenderingContext2D, direction: 'up' | 'down' | 'left' | 'right' | 'top') {
  const { width, height } = context.canvas
  context.clearRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) * 0.42

  context.fillStyle = 'rgba(255, 255, 255, 0.12)'
  context.fillRect(0, 0, width, height)

  context.strokeStyle = 'rgba(8, 8, 10, 0.74)'
  context.lineWidth = Math.max(6, width * 0.024)
  context.strokeRect(context.lineWidth / 2, context.lineWidth / 2, width - context.lineWidth, height - context.lineWidth)

  context.fillStyle = 'rgba(255, 255, 255, 0.06)'
  context.fillRect(width * 0.08, height * 0.08, width * 0.84, height * 0.14)

  context.save()
  context.translate(cx, cy)
  context.strokeStyle = 'rgba(245, 247, 250, 0.96)'
  context.fillStyle = 'rgba(245, 247, 250, 0.96)'
  context.lineWidth = Math.max(7, width * 0.026)
  context.lineCap = 'round'
  context.lineJoin = 'round'

  if (direction === 'top') {
    context.beginPath()
    context.arc(0, 0, radius * 0.21, 0, Math.PI * 2)
    context.stroke()

    context.beginPath()
    context.arc(0, 0, radius * 0.07, 0, Math.PI * 2)
    context.fill()
  } else {
    const arrowSize = radius * 0.58
    const half = arrowSize * 0.34
    const inset = arrowSize * 0.06
    context.beginPath()
    if (direction === 'up') {
      context.moveTo(0, -half)
      context.lineTo(-half, half - inset)
      context.lineTo(-half * 0.28, half - inset)
      context.lineTo(0, -half * 0.08)
      context.lineTo(half * 0.28, half - inset)
      context.lineTo(half, half - inset)
    } else if (direction === 'down') {
      context.moveTo(0, half)
      context.lineTo(-half, -half + inset)
      context.lineTo(-half * 0.28, -half + inset)
      context.lineTo(0, half * 0.08)
      context.lineTo(half * 0.28, -half + inset)
      context.lineTo(half, -half + inset)
    } else if (direction === 'left') {
      context.moveTo(-half, 0)
      context.lineTo(half - inset, -half)
      context.lineTo(half - inset, -half * 0.28)
      context.lineTo(-half * 0.08, 0)
      context.lineTo(half - inset, half * 0.28)
      context.lineTo(half - inset, half)
    } else {
      context.moveTo(half, 0)
      context.lineTo(-half + inset, -half)
      context.lineTo(-half + inset, -half * 0.28)
      context.lineTo(half * 0.08, 0)
      context.lineTo(-half + inset, half * 0.28)
      context.lineTo(-half + inset, half)
    }
    context.closePath()
    context.stroke()
  }

  context.setLineDash([1, Math.max(5, width * 0.03)])
  context.strokeStyle = 'rgba(245, 247, 250, 0.6)'
  context.beginPath()
  if (direction === 'top') {
    context.arc(0, 0, radius * 0.18, 0, Math.PI * 2)
  } else if (direction === 'up') {
    context.moveTo(0, -radius * 0.26)
    context.lineTo(0, radius * 0.26)
  } else if (direction === 'down') {
    context.moveTo(0, radius * 0.26)
    context.lineTo(0, -radius * 0.26)
  } else if (direction === 'left') {
    context.moveTo(-radius * 0.26, 0)
    context.lineTo(radius * 0.26, 0)
  } else {
    context.moveTo(radius * 0.26, 0)
    context.lineTo(-radius * 0.26, 0)
  }
  context.stroke()
  context.setLineDash([])

  context.fillStyle = 'rgba(0, 0, 0, 0.12)'
  context.beginPath()
  context.arc(-radius * 0.16, radius * 0.16, radius * 0.12, 0, Math.PI * 2)
  context.fill()

  context.restore()
}

function createButtonTexture(THREE: ThreeModule, direction: 'up' | 'down' | 'left' | 'right' | 'top') {
  const textureCanvas = document.createElement('canvas')
  textureCanvas.width = 512
  textureCanvas.height = 512
  const context = textureCanvas.getContext('2d')

  if (!context) {
    const texture = new THREE.CanvasTexture(textureCanvas)
    texture.needsUpdate = true
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }

  drawButtonMark(context, direction)

  const texture = new THREE.CanvasTexture(textureCanvas)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return texture
}

function resolveButtonCommand(name: string): AboutShowcaseCommand | null {
  const normalized = name.toLowerCase().replace(/[^a-z0-9_]+/g, '_')

  if (/(^|_)btn_left($|_)/.test(normalized)) {
    return 'rotate-left'
  }

  if (/(^|_)btn_right($|_)/.test(normalized)) {
    return 'rotate-right'
  }

  if (/(^|_)btn_up($|_)/.test(normalized)) {
    return 'tilt-up'
  }

  if (/(^|_)btn_down($|_)/.test(normalized)) {
    return 'tilt-down'
  }

  if (/(^|_)screen($|_)/.test(normalized)) {
    return 'focus-screen'
  }

  return null
}

export function AboutShowcaseModel({
  modelUrl = '/models/about-showcase.glb?v=20260505-1',
  onCommand,
  activeCommand = null,
}: AboutShowcaseModelProps) {
  const { scrollOffset, viewportHeight } = useAppShellScroll()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const screenOverlayRef = useRef<HTMLDivElement | null>(null)
  const scrollOffsetRef = useRef(scrollOffset)
  const viewportHeightRef = useRef(viewportHeight)
  const onCommandRef = useRef(onCommand)
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
    const canvas = canvasRef.current
    const hotspotLayer = overlayRef.current
    const screenLayer = screenOverlayRef.current
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
    let threeModule: ThreeModule | null = null
    const textures: InstanceType<ThreeModule['Texture']>[] = []
    const buttonTargets: ButtonTarget[] = []
    const buttonHotspots: ButtonHotspot[] = []
    const pendingShells: Array<{
      shell: InstanceType<ThreeModule['Mesh']>
      parent: InstanceType<ThreeModule['Object3D']> | null
    }> = []
    const overlayMeshes: InstanceType<ThreeModule['Mesh']>[] = []
    const outlineMeshes: InstanceType<ThreeModule['Mesh']>[] = []
    const pointer: PointerState = { x: 0, y: 0 }
    const targetPointer: PointerState = { x: 0, y: 0 }
    let raycaster: InstanceType<ThreeModule['Raycaster']> | null = null
    let pointerNdc: InstanceType<ThreeModule['Vector2']> | null = null
    const basePose = {
      rotationX: 0.08,
      rotationY: -0.16,
      rotationZ: -0.02,
      scale: 0.92,
      positionY: 0,
    }
    const currentControlPose = {
      rotationX: basePose.rotationX,
      rotationY: basePose.rotationY,
      rotationZ: basePose.rotationZ,
      scale: basePose.scale,
      positionY: basePose.positionY,
    }
    const targetControlPose = {
      rotationX: basePose.rotationX,
      rotationY: basePose.rotationY,
      rotationZ: basePose.rotationZ,
      scale: basePose.scale,
      positionY: basePose.positionY,
    }
    let hoveredTarget: ButtonTarget | null = null
    let cameraTargetZ = 5.2
    let screenTarget: InstanceType<ThreeModule['Mesh']> | null = null

    const syncHover = (nextTarget: ButtonTarget | null) => {
      if (hoveredTarget === nextTarget) {
        return
      }

      if (hoveredTarget) {
        hoveredTarget.visualMesh.scale.copy(hoveredTarget.baseScale)
        const material = hoveredTarget.visualMesh.material
        if (!Array.isArray(material) && 'emissiveIntensity' in material) {
          material.emissiveIntensity = hoveredTarget.baseEmissiveIntensity
        }
      }

      hoveredTarget = nextTarget

      if (hoveredTarget) {
        hoveredTarget.visualMesh.scale.copy(hoveredTarget.baseScale).multiplyScalar(1.06)
        const material = hoveredTarget.visualMesh.material
        if (!Array.isArray(material) && 'emissiveIntensity' in material) {
          material.emissiveIntensity = hoveredTarget.baseEmissiveIntensity + 0.12
        }
      }
    }

    const emitModelHoverState = (active: boolean) => {
      window.dispatchEvent(
        new CustomEvent('about-model-hover-state', {
          detail: { active },
        }),
      )
    }

    const fitCameraToModel = () => {
      if (!camera || !loadedModel || !threeModule) {
        return
      }

      const box = new threeModule.Box3().setFromObject(loadedModel)
      const size = box.getSize(new threeModule.Vector3())
      if (size.x <= 0 || size.y <= 0 || size.z <= 0) {
        return
      }

      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      const aspect = Math.max(0.01, width / height)
      const fov = threeModule.MathUtils.degToRad(camera.fov)
      const fitPadding = 1.18
      const modelScale = Math.max(currentControlPose.scale, targetControlPose.scale, basePose.scale)

      const halfHeight = (size.y * modelScale) / 2
      const halfWidth = (size.x * modelScale) / 2
      const verticalDistance = halfHeight / Math.tan(fov / 2)
      const horizontalDistance = halfWidth / (Math.tan(fov / 2) * aspect)
      const depthBuffer = size.z * modelScale * 0.2

      cameraTargetZ = Math.max(verticalDistance, horizontalDistance) * fitPadding + depthBuffer
      camera.position.z = cameraTargetZ
    }

    const projectObjectRect = (object: InstanceType<ThreeModule['Object3D']>) => {
      const activeCamera = camera
      if (!activeCamera || !threeModule) {
        return null
      }

      const rect = canvas.getBoundingClientRect()
      const box = new threeModule.Box3().setFromObject(object)
      if (box.isEmpty()) {
        return null
      }

      const corners = [
        new threeModule.Vector3(box.min.x, box.min.y, box.min.z),
        new threeModule.Vector3(box.min.x, box.min.y, box.max.z),
        new threeModule.Vector3(box.min.x, box.max.y, box.min.z),
        new threeModule.Vector3(box.min.x, box.max.y, box.max.z),
        new threeModule.Vector3(box.max.x, box.min.y, box.min.z),
        new threeModule.Vector3(box.max.x, box.min.y, box.max.z),
        new threeModule.Vector3(box.max.x, box.max.y, box.min.z),
        new threeModule.Vector3(box.max.x, box.max.y, box.max.z),
      ]

      let minX = Number.POSITIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      let visible = false

      corners.forEach((corner) => {
        const projected = corner.project(activeCamera)
        if (projected.z < -1 || projected.z > 1) {
          return
        }

        visible = true
        const screenX = rect.left + ((projected.x + 1) * rect.width) / 2
        const screenY = rect.top + ((1 - projected.y) * rect.height) / 2
        minX = Math.min(minX, screenX)
        minY = Math.min(minY, screenY)
        maxX = Math.max(maxX, screenX)
        maxY = Math.max(maxY, screenY)
      })

      if (!visible || !Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
        return null
      }

      return {
        left: minX,
        top: minY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
      }
    }

    const syncHotspotElement = (
      hotspot: ButtonHotspot,
      rect: { left: number; top: number; width: number; height: number } | null,
    ) => {
      const style = hotspot.element.style
      if (!rect) {
        style.display = 'none'
        return
      }

      const canvasRect = canvas.getBoundingClientRect()
      const shrinkRatio = 0.68
      const width = Math.max(1, rect.width * shrinkRatio)
      const height = Math.max(1, rect.height * shrinkRatio)
      style.display = 'block'
      style.left = `${rect.left - canvasRect.left + (rect.width - width) / 2}px`
      style.top = `${rect.top - canvasRect.top + (rect.height - height) / 2}px`
      style.width = `${width}px`
      style.height = `${height}px`
      style.opacity = '0'
      style.border = 'none'
      style.background = 'transparent'
      style.boxShadow = 'none'
    }

    const syncScreenLayer = (rect: { left: number; top: number; width: number; height: number } | null) => {
      if (!screenLayer) {
        return
      }

      const style = screenLayer.style
      if (!rect) {
        style.display = 'none'
        return
      }

      const canvasRect = canvas.getBoundingClientRect()
      const insetX = rect.width * 0.07
      const insetY = rect.height * 0.1
      style.display = 'block'
      style.left = `${rect.left - canvasRect.left + insetX}px`
      style.top = `${rect.top - canvasRect.top + insetY}px`
      style.width = `${Math.max(1, rect.width - insetX * 2)}px`
      style.height = `${Math.max(1, rect.height - insetY * 2)}px`
    }

    const createTexturedMaterial = (
      THREE: ThreeModule,
      maps: {
        baseColor?: InstanceType<ThreeModule['Texture']>
        normal?: InstanceType<ThreeModule['Texture']>
        roughness?: InstanceType<ThreeModule['Texture']>
        metalness?: InstanceType<ThreeModule['Texture']>
      },
      options: {
        color?: number
        emissive?: number
        emissiveIntensity?: number
        roughness?: number
        metalness?: number
        gradientMap?: InstanceType<ThreeModule['Texture']>
      } = {},
    ) => {
      const material = new THREE.MeshToonMaterial({
        color: options.color ?? 0xffffff,
        map: maps.baseColor ?? null,
        gradientMap: options.gradientMap ?? null,
        side: THREE.DoubleSide,
      })

      material.emissive = new THREE.Color(options.emissive ?? 0x000000)
      material.emissiveIntensity = options.emissiveIntensity ?? 0
      return material
    }

    const createOutlineMaterial = (THREE: ThreeModule) => {
      return new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: true,
      })
    }

    const buildButtonShell = (mesh: InstanceType<ThreeModule['Mesh']>, THREE: ThreeModule) => {
      mesh.geometry.computeBoundingBox()
      const bounds = mesh.geometry.boundingBox?.clone()
      const size = bounds?.getSize(new THREE.Vector3()) ?? new THREE.Vector3(0.12, 0.12, 0.04)
      const shellGeometry = new THREE.BoxGeometry(
        Math.max(size.x * 1.08, 0.08),
        Math.max(size.y * 1.08, 0.08),
        Math.max(size.z * 1.24, 0.03),
      )
      const shell = new THREE.Mesh(shellGeometry, createButtonShellMaterial(THREE))
      shell.name = `${mesh.name ?? 'button'}_interaction_shell`
      shell.position.copy(mesh.position)
      shell.rotation.copy(mesh.rotation)
      shell.scale.copy(mesh.scale).multiplyScalar(1.22)
      shell.visible = true
      shell.renderOrder = mesh.renderOrder + 1
      shell.userData.interactionShell = true
      pendingShells.push({
        shell,
        parent: mesh.parent,
      })
      return shell
    }

    const runCommand = (command: AboutShowcaseCommand) => {
      onCommandRef.current?.(command)
      window.dispatchEvent(
        new CustomEvent('about-showcase-command', {
          detail: { command },
        }),
      )
    }

    const load = async () => {
      try {
        const THREE = await import('three')
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        threeModule = THREE

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
        renderer.toneMapping = THREE.NoToneMapping
        renderer.setClearColor(0x000000, 0)

        scene = new THREE.Scene()
        scene.background = null
        camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
        camera.position.set(0, 0.02, 5.2)
        raycaster = new THREE.Raycaster()
        pointerNdc = new THREE.Vector2()

        const ambient = new THREE.AmbientLight(0xffffff, 1.85)
        const hemi = new THREE.HemisphereLight(0xffffff, 0x21242a, 1.0)
        const key = new THREE.DirectionalLight(0xfff5ea, 2.0)
        key.position.set(4.8, 5.5, 7)
        const fill = new THREE.DirectionalLight(0xdfe5ef, 0.9)
        fill.position.set(-5, 2, 4.5)
        const rim = new THREE.DirectionalLight(0xbfc7d4, 0.35)
        rim.position.set(-4.2, 2.6, -3.5)

        scene.add(ambient, hemi, key, fill, rim)

        rootGroup = new THREE.Group()
        scene.add(rootGroup)

        const halftoneTexture = createHalftoneTexture(THREE)
        textures.push(halftoneTexture)
        const halftonePlane = new THREE.Mesh(
          new THREE.PlaneGeometry(8, 8),
          new THREE.MeshBasicMaterial({
            map: halftoneTexture,
            color: 0x141414,
            transparent: true,
            opacity: 0.09,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide,
          }),
        )
        halftonePlane.position.set(0, 0, 3.2)
        scene.add(halftonePlane)
        overlayMeshes.push(halftonePlane)

        const loader = new GLTFLoader()
        const gltf = await loader.loadAsync(modelUrl)

        if (disposed || !rootGroup) {
          return
        }

        const model = gltf.scene
        const comicGradientMap = createComicGradientMap(THREE)
        textures.push(comicGradientMap)
        const activeRenderer = renderer
        if (!activeRenderer) {
          return
        }
        const textureLoader = new THREE.TextureLoader()
        const textureBasePath = '/models/about-showcase.fbm'
        const [baseColorTexture, normalTexture, roughnessTexture, metallicTexture] = await Promise.all([
          textureLoader.loadAsync(`${textureBasePath}/tripo_node_3f37b1b5-cde1-4686-a0c4-dd5d8914f05c_BaseColor.jpg`),
          textureLoader.loadAsync(`${textureBasePath}/tripo_node_3f37b1b5-cde1-4686-a0c4-dd5d8914f05c_Normal_Bake.jpg`),
          textureLoader.loadAsync(`${textureBasePath}/handhelddevice3dmodel_roughness.JPEG`),
          textureLoader.loadAsync(`${textureBasePath}/handhelddevice3dmodel_metallic.JPEG`),
        ])

        ;[baseColorTexture, normalTexture, roughnessTexture, metallicTexture].forEach((texture) => {
          texture.flipY = false
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          texture.anisotropy = activeRenderer.capabilities.getMaxAnisotropy()
          texture.needsUpdate = true
        })
        baseColorTexture.colorSpace = THREE.SRGBColorSpace
        normalTexture.colorSpace = THREE.NoColorSpace
        roughnessTexture.colorSpace = THREE.NoColorSpace
        metallicTexture.colorSpace = THREE.NoColorSpace
        textures.push(baseColorTexture, normalTexture, roughnessTexture, metallicTexture)
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())

        model.position.sub(center)
        model.scale.setScalar(1)
        model.rotation.set(Math.PI / 2, 0, 0)
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
            screenTarget = mesh
            mesh.material = createTexturedMaterial(
              THREE,
              {
                baseColor: baseColorTexture,
              },
              {
                color: 0xdde3ee,
                emissive: 0x05080c,
                emissiveIntensity: 0.05,
                gradientMap: comicGradientMap,
              },
            )
            return
          }

          if (/btn|button|arrow|left|right|up|down|top/.test(name)) {
            const direction = /left/.test(name)
              ? 'left'
              : /right/.test(name)
                ? 'right'
                : /up/.test(name)
                  ? 'up'
                : /down/.test(name)
                    ? 'down'
                    : 'top'
            const buttonTexture = createButtonTexture(THREE, direction)
            textures.push(buttonTexture)
            mesh.material = createTexturedMaterial(
              THREE,
              {
                baseColor: baseColorTexture,
                normal: normalTexture,
                roughness: roughnessTexture,
                metalness: metallicTexture,
              },
              {
                color: 0xcbd5e1,
                emissive: 0xffffff,
                emissiveIntensity: 0.12,
                gradientMap: comicGradientMap,
              },
            )
            const material = mesh.material as InstanceType<ThreeModule['MeshToonMaterial']>
            material.map = buttonTexture
            material.needsUpdate = true
            const shell = buildButtonShell(mesh, THREE)
            const command = resolveButtonCommand(name)
            if (command) {
              buttonTargets.push({
                hitMesh: shell,
                visualMesh: mesh,
                command,
                baseScale: mesh.scale.clone(),
                baseEmissiveIntensity: 0.18,
              })
            }
            return
          }

          if (/body|frame|shell/.test(name)) {
            mesh.material = createTexturedMaterial(
              THREE,
              {
                baseColor: baseColorTexture,
                normal: normalTexture,
                roughness: roughnessTexture,
                metalness: metallicTexture,
              },
              {
                color: /frame/.test(name) ? 0xd8dee8 : 0xb6bcc8,
                emissive: 0x050505,
                emissiveIntensity: 0.03,
                gradientMap: comicGradientMap,
              },
            )
            return
          }

          mesh.material = createTexturedMaterial(
            THREE,
            {
              baseColor: baseColorTexture,
              normal: normalTexture,
              roughness: roughnessTexture,
              metalness: metallicTexture,
            },
            {
              color: 0x9aa0aa,
              emissive: 0x050505,
              emissiveIntensity: 0.03,
              gradientMap: comicGradientMap,
            },
          )
        })

        model.traverse((object) => {
          const mesh = object as InstanceType<ThreeModule['Mesh']>
          if (!('isMesh' in mesh) || !mesh.isMesh) {
            return
          }

          const outline = mesh.clone()
          outline.name = `${mesh.name ?? 'mesh'}_outline`
          outline.material = createOutlineMaterial(THREE)
          outline.scale.multiplyScalar(1.03)
          outline.renderOrder = mesh.renderOrder - 1
          outlineMeshes.push(outline)
          mesh.parent?.add(outline)
        })

        pendingShells.forEach(({ shell, parent }) => {
          parent?.add(shell)
        })

        if (hotspotLayer) {
          hotspotLayer.replaceChildren()
          buttonHotspots.splice(0, buttonHotspots.length)

          buttonTargets.forEach((target) => {
            const hotspot = document.createElement('button')
            hotspot.type = 'button'
            hotspot.className = 'about-showcase-model__hotspot magnetic-target'
            hotspot.dataset.magneticShell = 'compact'
            hotspot.dataset.magneticActive = 'false'
            hotspot.setAttribute('aria-label', target.command)
            hotspot.addEventListener('pointerenter', () => {
              syncHover(target)
              emitModelHoverState(true)
            })
            hotspot.addEventListener('pointerleave', () => {
              syncHover(null)
              emitModelHoverState(false)
            })
            hotspot.addEventListener('click', () => {
              runCommand(target.command)
            })
            hotspotLayer.appendChild(hotspot)
            buttonHotspots.push({ target, element: hotspot })
          })
        }

        camera.lookAt(0, 0, 0)
        fitCameraToModel()

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
      fitCameraToModel()
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      targetPointer.x = clamp(x, -1, 1)
      targetPointer.y = clamp(y, -1, 1)

      if (!camera || !raycaster || !pointerNdc || !loadedModel) {
        syncHover(null)
        emitModelHoverState(false)
        return
      }

      pointerNdc.set(x, y)
      raycaster.setFromCamera(pointerNdc, camera)
      const modelHits = raycaster.intersectObject(loadedModel, true)
      const intersections = raycaster.intersectObjects(
        buttonTargets.map((entry) => entry.hitMesh),
        false,
      )
      const hitMesh = intersections[0]?.object as InstanceType<ThreeModule['Mesh']> | undefined
      const hitTarget = hitMesh ? buttonTargets.find((entry) => entry.hitMesh === hitMesh) ?? null : null
      syncHover(hitTarget)
      emitModelHoverState(modelHits.length > 0)
    }

    const handlePointerLeave = () => {
      targetPointer.x = 0
      targetPointer.y = 0
      syncHover(null)
      emitModelHoverState(false)
    }

    const handlePointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)

      if (!camera || !raycaster || !pointerNdc || buttonTargets.length === 0) {
        return
      }

      pointerNdc.set(x, y)
      raycaster.setFromCamera(pointerNdc, camera)
      const intersections = raycaster.intersectObjects(
        buttonTargets.map((entry) => entry.hitMesh),
        false,
      )
      const hitMesh = intersections[0]?.object as InstanceType<ThreeModule['Mesh']> | undefined
      const hitTarget = hitMesh ? buttonTargets.find((entry) => entry.hitMesh === hitMesh) ?? null : null

      if (hitTarget) {
        runCommand(hitTarget.command)
      }
    }

    void load()

    observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerleave', handlePointerLeave)
    canvas.addEventListener('pointerdown', handlePointerDown)

    const tick = (time: number) => {
      if (!disposed && renderer && scene && camera && rootGroup) {
        const currentViewportHeight = viewportHeightRef.current
        const currentScrollOffset = scrollOffsetRef.current
        const sectionProgress = currentViewportHeight > 0 ? currentScrollOffset / currentViewportHeight - 1 : 0
        const pullProgress = smoothstep(-0.2, 0.25, sectionProgress)
        const fallProgress = smoothstep(0.18, 0.98, sectionProgress)
        const settleMix = smoothstep(-0.05, 0.48, sectionProgress)

        pointer.x += (targetPointer.x - pointer.x) * 0.08
        pointer.y += (targetPointer.y - pointer.y) * 0.08

        currentControlPose.rotationX += (targetControlPose.rotationX - currentControlPose.rotationX) * 0.08
        currentControlPose.rotationY += (targetControlPose.rotationY - currentControlPose.rotationY) * 0.08
        currentControlPose.rotationZ += (targetControlPose.rotationZ - currentControlPose.rotationZ) * 0.08
        currentControlPose.scale += (targetControlPose.scale - currentControlPose.scale) * 0.08
        currentControlPose.positionY += (targetControlPose.positionY - currentControlPose.positionY) * 0.08

        const scrollPoseRotationX = lerp(0.18, 0.02, pullProgress)
        const scrollPoseRotationY = lerp(-0.26, -0.06, pullProgress)
        const scrollPoseRotationZ = lerp(-0.08, 0, pullProgress)
        const scrollPoseScale = lerp(0.88, 0.96, pullProgress) - fallProgress * 0.02
        const scrollPosePositionY = lerp(0.22, 0.02, pullProgress) + lerp(0, -0.18, fallProgress)

        rootGroup.rotation.x = lerp(scrollPoseRotationX, currentControlPose.rotationX, settleMix) - pointer.y * 0.03
        rootGroup.rotation.y = lerp(scrollPoseRotationY, currentControlPose.rotationY, settleMix) + pointer.x * 0.05
        rootGroup.rotation.z =
          lerp(scrollPoseRotationZ, currentControlPose.rotationZ, settleMix) + Math.sin(time * 0.00022) * 0.006
        rootGroup.scale.setScalar(lerp(scrollPoseScale, currentControlPose.scale, settleMix))
        rootGroup.position.y =
          lerp(scrollPosePositionY, currentControlPose.positionY, settleMix) + Math.sin(time * 0.0008) * 0.008

        camera.position.x += (0 - camera.position.x) * 0.05
        camera.position.y += (0.02 - camera.position.y) * 0.05
        camera.position.z += (cameraTargetZ - camera.position.z) * 0.05
        camera.lookAt(0, 0, 0)

        if (buttonHotspots.length > 0) {
          buttonHotspots.forEach((hotspot) => {
            const rect = projectObjectRect(hotspot.target.visualMesh)
            syncHotspotElement(hotspot, rect)
          })
        }

        syncScreenLayer(screenTarget ? projectObjectRect(screenTarget) : null)

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
      canvas.removeEventListener('pointerdown', handlePointerDown)
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
      overlayMeshes.forEach((mesh) => {
        mesh.geometry.dispose()
        const material = mesh.material
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose())
        } else {
          material.dispose()
        }
      })
      outlineMeshes.forEach((mesh) => {
        const material = mesh.material
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose())
        } else {
          material.dispose()
        }
      })
      pendingShells.forEach(({ shell }) => {
        shell.geometry.dispose()
        const material = shell.material
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose())
        } else {
          material.dispose()
        }
      })
      hotspotLayer?.replaceChildren()
      buttonHotspots.splice(0, buttonHotspots.length)
      if (screenLayer) {
        screenLayer.style.display = 'none'
      }
      textures.forEach((texture) => texture.dispose())
      emitModelHoverState(false)
      renderer?.dispose()
    }
  }, [modelUrl])

  return (
    <div className={`about-showcase-model${ready ? ' about-showcase-model--ready' : ''}${failed ? ' about-showcase-model--failed' : ''}`}>
      <canvas ref={canvasRef} className="about-showcase-model__canvas" aria-hidden="true" />
      <div ref={overlayRef} className="about-showcase-model__hotspot-layer" aria-hidden="true" />
      <div ref={screenOverlayRef} className="about-showcase-model__screen-layer" aria-hidden="true">
        <AboutShowcaseDom activeCommand={activeCommand} variant="screen" />
      </div>
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
