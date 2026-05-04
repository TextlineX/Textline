import { useEffect, useRef } from 'react'

import { heroDataset } from '../../data/heroDataset'
import { heroThreeConfig } from '../../data/heroThreeConfig'
import './ThreeSphereScene.less'

type ThreeModule = typeof import('three')

type RibbonToken = {
  text: string
  color: string
}

const ribbonColors = {
  text: 'rgba(224, 224, 224, 0.84)',
  ember: 'rgba(229, 61, 61, 0.84)',
  violet: 'rgba(110, 99, 199, 0.66)',
  cyan: 'rgba(101, 196, 200, 0.66)',
  muted: 'rgba(224, 224, 224, 0.36)',
}

function classifyRibbonToken(text: string, index: number) {
  if (text === 'TEXTLINE') {
    return ribbonColors.ember
  }

  if (text === 'AI' || text === 'REACT' || text === 'TYPESCRIPT') {
    return index % 2 === 0 ? ribbonColors.cyan : ribbonColors.muted
  }

  if (text === 'VUE' || text === 'PYTHON' || text === 'BLENDER') {
    return index % 2 === 0 ? ribbonColors.violet : ribbonColors.muted
  }

  if (text === 'AXIOS' || text === 'UNITY') {
    return index % 2 === 0 ? ribbonColors.cyan : ribbonColors.violet
  }

  return index % 5 === 0 ? ribbonColors.text : ribbonColors.muted
}

function buildRibbonTokens() {
  const tokens: RibbonToken[] = []

  heroDataset.forEach((item, index) => {
    tokens.push({
      text: item,
      color: classifyRibbonToken(item, index),
    })

    tokens.push({
      text: ' · ',
      color: ribbonColors.muted,
    })
  })

  return tokens
}

export function ThreeSphereScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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
    let group: InstanceType<ThreeModule['Group']> | null = null
    const textures: InstanceType<ThreeModule['CanvasTexture']>[] = []
    const materials: InstanceType<ThreeModule['MeshBasicMaterial']>[] = []
    const geometries: InstanceType<ThreeModule['TubeGeometry']>[] = []
    const ribbonMeshes: InstanceType<ThreeModule['Mesh']>[] = []

    void (async () => {
      const THREE = await import('three')
      if (disposed || !canvasRef.current) {
        return
      }

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setClearColor(0x000000, 0)

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
      camera.position.z = 5.4

      group = new THREE.Group()
      group.rotation.x = heroThreeConfig.tiltAngle
      scene.add(group)

      const ribbonTokens = buildRibbonTokens()
      const ribbonTextureCanvas = document.createElement('canvas')
      ribbonTextureCanvas.width = heroThreeConfig.textCanvasWidth
      ribbonTextureCanvas.height = heroThreeConfig.textCanvasHeight
      const ribbonTextureContext = ribbonTextureCanvas.getContext('2d')

      const drawRibbonTexture = () => {
        if (!ribbonTextureContext) {
          return
        }

        const width = ribbonTextureCanvas.width
        const height = ribbonTextureCanvas.height
        ribbonTextureContext.clearRect(0, 0, width, height)

        ribbonTextureContext.save()
        ribbonTextureContext.font = `900 ${heroThreeConfig.fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`
        ribbonTextureContext.textBaseline = 'middle'
        ribbonTextureContext.textAlign = 'left'

        const baselineY = height * 0.5
        const gap = 48
        const rowTokens = [...ribbonTokens]
        const rowWidth = rowTokens.reduce((total, token) => {
          return total + ribbonTextureContext.measureText(token.text).width + gap
        }, 0)

        let x = 0
        while (x < width + rowWidth) {
          let cursorX = x
          for (const token of rowTokens) {
            const tokenWidth = ribbonTextureContext.measureText(token.text).width
            ribbonTextureContext.fillStyle = token.color
            ribbonTextureContext.fillText(token.text, cursorX, baselineY)
            cursorX += tokenWidth + gap
          }
          x += rowWidth + 180
        }
        ribbonTextureContext.restore()
      }

      drawRibbonTexture()

      const buildRibbonTexture = (phase: number) => {
        const texture = new THREE.CanvasTexture(ribbonTextureCanvas)
        texture.needsUpdate = true
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.repeat.set(1, 1)
        texture.offset.set(phase, 0)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.anisotropy = renderer?.capabilities.getMaxAnisotropy() ?? 1
        textures.push(texture)
        return texture
      }

      const normalizeVector = (vector: InstanceType<ThreeModule['Vector3']>) => {
        if (vector.lengthSq() === 0) {
          vector.set(1, 0, 0)
        }
        return vector.normalize()
      }

      const createRibbonNormal = (index: number, total: number) => {
        const phi = Math.acos(1 - (2 * (index + 0.5)) / total)
        const theta = Math.PI * (1 + Math.sqrt(5)) * index
        return new THREE.Vector3(
          Math.cos(theta) * Math.sin(phi),
          Math.cos(phi),
          Math.sin(theta) * Math.sin(phi),
        ).normalize()
      }

      const createRibbonCurve = (normal: InstanceType<ThreeModule['Vector3']>, seed: number) => {
        const tangent = normalizeVector(
          Math.abs(normal.y) < 0.9
            ? new THREE.Vector3(0, 1, 0).cross(normal)
            : new THREE.Vector3(1, 0, 0).cross(normal),
        )
        const bitangent = normalizeVector(new THREE.Vector3().crossVectors(normal, tangent))
        const points: InstanceType<ThreeModule['Vector3']>[] = []

        for (let sampleIndex = 0; sampleIndex <= heroThreeConfig.ribbonSegments; sampleIndex += 1) {
          const progress = sampleIndex / heroThreeConfig.ribbonSegments
          const angle = progress * Math.PI * 2
          const ripple = Math.sin(angle * 3 + seed * 0.35) * 0.055
            + Math.sin(angle * 7 - seed * 0.18) * 0.024
          const twist = Math.sin(angle * 2 - seed * 0.6) * 0.08

          const point = new THREE.Vector3()
            .addScaledVector(tangent, Math.cos(angle) * (1 + ripple))
            .addScaledVector(bitangent, Math.sin(angle) * (1 - ripple))
            .addScaledVector(normal, twist)
            .normalize()
            .multiplyScalar(heroThreeConfig.sphereRadius)

          points.push(point)
        }

        return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.16)
      }

      const ribbonCount = heroThreeConfig.ribbonCount
      for (let index = 0; index < ribbonCount; index += 1) {
        const normal = createRibbonNormal(index, ribbonCount)
        const curve = createRibbonCurve(normal, index)
        const geometry = new THREE.TubeGeometry(
          curve,
          heroThreeConfig.ribbonSegments,
          heroThreeConfig.ribbonRadius,
          heroThreeConfig.ribbonRadialSegments,
          true,
        )
        geometries.push(geometry)

        const texture = buildRibbonTexture((index / ribbonCount) * 0.7)
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          color: 0xffffff,
          opacity: heroThreeConfig.ribbonOpacity,
          alphaTest: 0.04,
          toneMapped: false,
        })
        materials.push(material)

        const ribbon = new THREE.Mesh(geometry, material)
        ribbonMeshes.push(ribbon)
        group.add(ribbon)
      }

      const resize = () => {
        if (!renderer || !camera) {
          return
        }

        const { width, height } = canvas.getBoundingClientRect()
        const safeWidth = Math.max(width, 1)
        const safeHeight = Math.max(height, 1)
        renderer.setSize(safeWidth, safeHeight, false)
        camera.aspect = safeWidth / safeHeight
        camera.updateProjectionMatrix()
      }

      observer = new ResizeObserver(() => {
        resize()
      })
      observer.observe(canvas)
      resize()

      const loop = (time: number) => {
        if (!renderer || !scene || !camera || !group || disposed) {
          return
        }

        group.rotation.y = time * heroThreeConfig.rotationSpeed

        for (let index = 0; index < textures.length; index += 1) {
          const texture = textures[index]
          texture.offset.x = ((time * heroThreeConfig.textScrollSpeed) + index * 0.045) % 1
          const material = materials[index]
          material.opacity =
            heroThreeConfig.ribbonOpacity *
            (0.84 + Math.sin(time * 0.00065 + index * 0.82) * 0.05)
        }

        renderer.render(scene, camera)
        frameId = window.requestAnimationFrame(loop)
      }

      frameId = window.requestAnimationFrame(loop)
    })()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      observer?.disconnect()
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((materialItem) => materialItem.dispose())
      textures.forEach((texture) => texture.dispose())
      ribbonMeshes.length = 0
      renderer?.dispose()
    }
  }, [])

  return (
    <div className="three-sphere-scene" aria-hidden="true">
      <canvas ref={canvasRef} className="three-sphere-scene__canvas" />
    </div>
  )
}
