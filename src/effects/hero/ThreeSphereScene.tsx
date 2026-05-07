import { useEffect, useRef } from 'react'

import { heroDataset } from '../../data/heroDataset'
import { textFlowTokens } from '../../data/textFlowTokens'
import { heroThreeConfig } from '../../data/heroThreeConfig'
import './ThreeSphereScene.less'

type ThreeModule = typeof import('three')

type RibbonToken = {
  text: string
  color: string
}

type ImpactParticle = {
  sprite: InstanceType<ThreeModule['Sprite']>
  material: InstanceType<ThreeModule['SpriteMaterial']>
  velocityX: number
  velocityY: number
  velocityZ: number
  life: number
  maxLife: number
  spin: number
  drag: number
}

type ThreeSphereSceneProps = {
  enabled?: boolean
  scrollPhysicsDirection?: number
  scrollPhysicsPulseId?: number
  scrollPhysicsStrength?: number
}

const ribbonColors = {
  bright: 'hsla(195, 100%, 85%, 0.98)',
  side: 'hsla(195, 80%, 70%, 0.78)',
  back: 'hsla(205, 50%, 30%, 0.24)',
  ice: 'hsla(195, 96%, 92%, 0.96)',
  pink: 'hsla(345, 100%, 91%, 0.72)',
  pinkSoft: 'hsla(345, 100%, 91%, 0.46)',
}

function classifyRibbonToken(text: string, index: number) {
  if (text === 'TEXTLINE') {
    return ribbonColors.bright
  }

  if (text === 'AI' || text === 'REACT' || text === 'TYPESCRIPT') {
    return index % 2 === 0 ? ribbonColors.bright : ribbonColors.side
  }

  if (text === 'VUE' || text === 'PYTHON' || text === 'BLENDER') {
    return index % 2 === 0 ? ribbonColors.ice : ribbonColors.back
  }

  if (text === 'AXIOS' || text === 'UNITY') {
    return index % 3 === 0 ? ribbonColors.pinkSoft : ribbonColors.side
  }

  if (text === ' · ') {
    return index % 2 === 0 ? ribbonColors.back : ribbonColors.side
  }

  return index % 4 === 0 ? ribbonColors.bright : ribbonColors.back
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
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
      color: ribbonColors.back,
    })
  })

  return tokens
}

const codeDebrisTokens = [...textFlowTokens, '=>', '{}', '[]', '()', 'const', 'let', 'fn', 'return', '++', '//']
const maxImpactParticles = 28
const activeLoopDelay = 33
const idleLoopDelay = 120

function pickDebrisToken(index: number) {
  return codeDebrisTokens[index % codeDebrisTokens.length]
}

function pickDebrisColor(token: string, index: number) {
  if (/^(const|let|return|fn)$/i.test(token)) {
    return index % 2 === 0 ? 'hsla(195, 100%, 85%, 0.9)' : 'hsla(345, 100%, 91%, 0.82)'
  }

  if (/^(\{|\}|\[|\]|\(|\)|=>|\+\+)$/.test(token)) {
    return index % 2 === 0 ? 'hsla(195, 70%, 60%, 0.84)' : 'hsla(205, 40%, 30%, 0.72)'
  }

  if (token === '//') {
    return index % 2 === 0 ? 'hsla(205, 50%, 30%, 0.24)' : 'hsla(195, 100%, 85%, 0.52)'
  }

  const colors = [
    'hsla(195, 100%, 85%, 0.7)',
    'hsla(195, 80%, 70%, 0.56)',
    'hsla(205, 50%, 30%, 0.16)',
    'hsla(345, 100%, 91%, 0.52)',
    'hsla(195, 96%, 92%, 0.42)',
  ]

  return colors[index % colors.length]
}

export function ThreeSphereScene({
  enabled = true,
  scrollPhysicsDirection = 1,
  scrollPhysicsPulseId = 0,
  scrollPhysicsStrength = 0,
}: ThreeSphereSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastPhysicsPulseIdRef = useRef(scrollPhysicsPulseId)
  const scrollPhysicsPulseIdRef = useRef(scrollPhysicsPulseId)
  const scrollPhysicsDirectionRef = useRef(scrollPhysicsDirection)
  const scrollPhysicsStrengthRef = useRef(scrollPhysicsStrength)

  useEffect(() => {
    scrollPhysicsPulseIdRef.current = scrollPhysicsPulseId
  }, [scrollPhysicsPulseId])

  useEffect(() => {
    scrollPhysicsDirectionRef.current = scrollPhysicsDirection
  }, [scrollPhysicsDirection])

  useEffect(() => {
    scrollPhysicsStrengthRef.current = scrollPhysicsStrength
  }, [scrollPhysicsStrength])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    let disposed = false
    let tickTimerId: number | null = null
    let observer: ResizeObserver | null = null
    let renderer: InstanceType<ThreeModule['WebGLRenderer']> | null = null
    let scene: InstanceType<ThreeModule['Scene']> | null = null
    let camera: InstanceType<ThreeModule['PerspectiveCamera']> | null = null
    let physicsGroup: InstanceType<ThreeModule['Group']> | null = null
    let visualGroup: InstanceType<ThreeModule['Group']> | null = null
    const textures: InstanceType<ThreeModule['CanvasTexture']>[] = []
    const materials: InstanceType<ThreeModule['MeshBasicMaterial']>[] = []
    const geometries: InstanceType<ThreeModule['TubeGeometry']>[] = []
    const ribbonMeshes: InstanceType<ThreeModule['Mesh']>[] = []
    let collisionShell: InstanceType<ThreeModule['Mesh']> | null = null
    const impactParticles: ImpactParticle[] = []
    const fragmentTextureCache = new Map<string, InstanceType<ThreeModule['CanvasTexture']>>()
    const motion = {
      x: 0,
      y: 0,
      vx: 0,
      velocityY: 0,
      detached: false,
      returning: false,
    }
    let visualRotationZ = 0
    let settleFrames = 0
    let lastScrollImpulseAt = 0
    let lastImpactBurstAt = 0
    let returnStartedAt = 0
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

      physicsGroup = new THREE.Group()
      physicsGroup.rotation.x = heroThreeConfig.tiltAngle
      scene.add(physicsGroup)

      collisionShell = new THREE.Mesh(
        new THREE.SphereGeometry(heroThreeConfig.sphereRadius * 1.18, 28, 20),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      )
      physicsGroup.add(collisionShell)

      visualGroup = new THREE.Group()
      physicsGroup.add(visualGroup)

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
            if (token.text === 'TEXTLINE') {
              ribbonTextureContext.shadowColor = 'hsla(195, 100%, 83%, 0.8)'
              ribbonTextureContext.shadowBlur = 26
            } else if (token.text === 'AI' || token.text === 'REACT' || token.text === 'TYPESCRIPT') {
              ribbonTextureContext.shadowColor = 'hsla(195, 100%, 85%, 0.28)'
              ribbonTextureContext.shadowBlur = 14
            } else if (token.text === 'VUE' || token.text === 'PYTHON' || token.text === 'BLENDER') {
              ribbonTextureContext.shadowColor = 'hsla(345, 100%, 91%, 0.18)'
              ribbonTextureContext.shadowBlur = 10
            } else {
              ribbonTextureContext.shadowColor = 'transparent'
              ribbonTextureContext.shadowBlur = 0
            }
            ribbonTextureContext.fillText(token.text, cursorX, baselineY)
            cursorX += tokenWidth + gap
          }
          x += rowWidth + 180
        }
        ribbonTextureContext.shadowBlur = 0
        ribbonTextureContext.shadowColor = 'transparent'
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

      const buildDebrisTexture = (token: string, color: string) => {
        const cacheKey = `${token}|${color}`
        const cached = fragmentTextureCache.get(cacheKey)
        if (cached) {
          return cached
        }

        const debrisCanvas = document.createElement('canvas')
        const debrisContext = debrisCanvas.getContext('2d')
        if (!debrisContext) {
          const emptyTexture = new THREE.CanvasTexture(debrisCanvas)
          emptyTexture.needsUpdate = true
          fragmentTextureCache.set(cacheKey, emptyTexture)
          return emptyTexture
        }

        const fontSize = 28
        debrisContext.font = `700 ${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`
        const width = Math.ceil(debrisContext.measureText(token).width) + 18
        const height = 44
        debrisCanvas.width = width * 2
        debrisCanvas.height = height * 2
        debrisContext.scale(2, 2)
        debrisContext.clearRect(0, 0, width, height)
        debrisContext.font = `700 ${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`
        debrisContext.textBaseline = 'middle'
        debrisContext.textAlign = 'center'
        debrisContext.fillStyle = color
        debrisContext.fillText(token, width / 2, height / 2)

        const debrisTexture = new THREE.CanvasTexture(debrisCanvas)
        debrisTexture.needsUpdate = true
        debrisTexture.colorSpace = THREE.SRGBColorSpace
        debrisTexture.minFilter = THREE.LinearFilter
        debrisTexture.magFilter = THREE.LinearFilter
        fragmentTextureCache.set(cacheKey, debrisTexture)
        return debrisTexture
      }

      const normalizeVector = (vector: InstanceType<ThreeModule['Vector3']>) => {
        if (vector.lengthSq() === 0) {
          vector.set(1, 0, 0)
        }
        return vector.normalize()
      }

      const impactOriginVector = new THREE.Vector3()
      const worldOriginVector = new THREE.Vector3()

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

      const emitImpactBurst = (
        origin: InstanceType<ThreeModule['Vector3']>,
        impulse: number,
        direction: number,
      ) => {
        if (!scene || !physicsGroup) {
          return
        }

        const now = performance.now()
        if (now - lastImpactBurstAt < 90) {
          return
        }

        lastImpactBurstAt = now
        physicsGroup.updateMatrixWorld(true)

        const burstCount = clamp(Math.round(7 + impulse * 30), 7, 16)
        const worldOrigin = physicsGroup.localToWorld(worldOriginVector.copy(origin))

        for (let index = 0; index < burstCount; index += 1) {
          if (impactParticles.length >= maxImpactParticles) {
            const recycled = impactParticles.shift()
            if (recycled) {
              scene.remove(recycled.sprite)
              recycled.material.dispose()
            }
          }

          const token = pickDebrisToken(index + Math.floor(now / 140))
          const color = pickDebrisColor(token, index + Math.floor(now / 220))
          const texture = buildDebrisTexture(token, color)
          const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            depthWrite: false,
            depthTest: false,
            color: 0xffffff,
            toneMapped: false,
          })
          const sprite = new THREE.Sprite(material)
          const angle = (index / burstCount) * Math.PI * 2
          const spread = 0.018 + Math.random() * 0.016
          const horizontalKick = Math.cos(angle) * spread * impulse * 2.4
          const depthKick = Math.sin(angle) * spread * impulse * 0.7
          const downwardKick = -0.012 - Math.random() * 0.02

          sprite.position.copy(worldOrigin)
          sprite.position.x += horizontalKick + (Math.random() - 0.5) * 0.02
          sprite.position.y += (Math.random() - 0.5) * 0.012
          sprite.position.z += depthKick
          sprite.scale.setScalar(0.055 + Math.random() * 0.075)
          sprite.renderOrder = 4
          scene.add(sprite)

          impactParticles.push({
            sprite,
            material,
            velocityX: horizontalKick * 0.55 + (Math.random() - 0.5) * 0.01,
            velocityY: downwardKick,
            velocityZ: depthKick * 0.4 + (Math.random() - 0.5) * 0.01,
            life: 0,
            maxLife: 48 + Math.random() * 24,
            spin: (Math.random() - 0.5) * 0.03 * direction,
            drag: 0.962 + Math.random() * 0.018,
          })
        }
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
        visualGroup.add(ribbon)
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

      const scheduleTick = (delay: number) => {
        if (disposed) {
          return
        }

        if (tickTimerId !== null) {
          window.clearTimeout(tickTimerId)
          tickTimerId = null
        }

        tickTimerId = window.setTimeout(() => {
          tickTimerId = null
          if (disposed) {
            return
          }

          loop(performance.now())
        }, delay)
      }

      const loop = (time: number) => {
        if (!renderer || !scene || !camera || !physicsGroup || !visualGroup || disposed) {
          return
        }

        const currentPhysicsDirection = scrollPhysicsDirectionRef.current
        const currentPhysicsStrength = scrollPhysicsStrengthRef.current
        const currentPhysicsPulseId = scrollPhysicsPulseIdRef.current

        if (currentPhysicsPulseId !== lastPhysicsPulseIdRef.current && currentPhysicsDirection > 0) {
          lastPhysicsPulseIdRef.current = currentPhysicsPulseId
          motion.detached = true
          motion.returning = false
          lastScrollImpulseAt = time
          const impulse = clamp(currentPhysicsStrength, 0.06, 0.22)
          motion.velocityY -= impulse
          motion.vx += Math.sin(time * 0.0013 + currentPhysicsPulseId * 0.41) * impulse * 0.38
        }

        const idleMs = time - lastScrollImpulseAt
        if (motion.detached && idleMs > 1600) {
          motion.returning = true
          if (returnStartedAt === 0) {
            returnStartedAt = time
          }
        }

        const friction = motion.detached ? 0.995 : motion.returning ? 0.88 : 0.86
        const gravity = motion.detached && !motion.returning ? 0.0011 : 0
        const returnPull = motion.returning ? 0.06 : 0

        motion.vx *= friction
        motion.velocityY *= friction
        motion.velocityY += gravity
        if (motion.detached && motion.y > 0.28 && motion.velocityY <= 0) {
          motion.velocityY += 0.0008
        }

        if (motion.returning) {
          motion.vx += (0 - motion.x) * returnPull
          motion.velocityY += (0 - motion.y) * returnPull
        } else if (!motion.detached) {
          motion.vx += (0 - motion.x) * 0.02
          motion.velocityY += (0 - motion.y) * 0.02
        }

        motion.x += motion.vx
        motion.y += motion.velocityY

        const horizontalBound = motion.detached ? 0.86 : 0.28
        const verticalBound = motion.detached ? 1.08 : 0.28

        let impactImpulse = 0
        let impactDirection = 1
        let impactOrigin: InstanceType<ThreeModule['Vector3']> | null = null

        if (motion.x > horizontalBound) {
          const preBounce = Math.abs(motion.vx)
          motion.x = horizontalBound
          motion.vx *= motion.detached ? -0.72 : -0.2
          impactImpulse = Math.max(impactImpulse, preBounce)
          impactDirection = motion.x >= 0 ? 1 : -1
          impactOrigin = impactOriginVector.set(motion.x, motion.y, 0)
        } else if (motion.x < -horizontalBound) {
          const preBounce = Math.abs(motion.vx)
          motion.x = -horizontalBound
          motion.vx *= motion.detached ? -0.72 : -0.2
          impactImpulse = Math.max(impactImpulse, preBounce)
          impactDirection = motion.x >= 0 ? 1 : -1
          impactOrigin = impactOriginVector.set(motion.x, motion.y, 0)
        }

        if (motion.y > verticalBound) {
          const preBounce = Math.abs(motion.velocityY)
          motion.y = verticalBound
          motion.velocityY *= motion.detached ? -0.68 : -0.2
          impactImpulse = Math.max(impactImpulse, preBounce)
          impactDirection = motion.y >= 0 ? 1 : -1
          impactOrigin = impactOriginVector.set(motion.x, motion.y, 0)
        } else if (motion.y < -verticalBound) {
          const preBounce = Math.abs(motion.velocityY)
          motion.y = -verticalBound
          motion.velocityY *= motion.detached ? -0.72 : -0.2
          impactImpulse = Math.max(impactImpulse, preBounce)
          impactDirection = motion.y >= 0 ? 1 : -1
          impactOrigin = impactOriginVector.set(motion.x, motion.y, 0)
        }

        if (impactOrigin && impactImpulse > 0.04) {
          emitImpactBurst(impactOrigin, clamp(impactImpulse, 0.04, 0.22), impactDirection)
        }

        physicsGroup.position.x = motion.x
        physicsGroup.position.y = motion.y
        const targetRotationZ = motion.detached ? motion.x * 0.08 : motion.returning ? 0 : motion.x * 0.024
        visualRotationZ += (targetRotationZ - visualRotationZ) * (motion.returning ? 0.12 : 0.11)
        physicsGroup.rotation.z = visualRotationZ

        const targetScale = motion.returning ? 1 : 1 + Math.abs(motion.y) * 0.018
        const currentScale = physicsGroup.scale.x
        const nextScale = currentScale + (targetScale - currentScale) * (motion.returning ? 0.14 : 0.12)
        physicsGroup.scale.set(nextScale, nextScale, 1)
        if (motion.detached || motion.returning) {
          visualGroup.rotation.y = motion.returning ? 0 : time * heroThreeConfig.rotationSpeed
        } else {
          visualGroup.rotation.y = 0
        }

        if (motion.returning) {
          const nearCenter =
            Math.abs(motion.x) < 0.024 &&
            Math.abs(motion.y) < 0.024 &&
            Math.abs(motion.vx) < 0.03 &&
            Math.abs(motion.velocityY) < 0.03
          settleFrames = nearCenter ? settleFrames + 1 : 0

          const returnElapsed = time - returnStartedAt
          if (settleFrames > 4 || returnElapsed > 1000) {
            motion.detached = false
            motion.returning = false
            motion.x = 0
            motion.y = 0
            motion.vx = 0
            motion.velocityY = 0
            settleFrames = 0
            returnStartedAt = 0
            visualRotationZ = 0
            physicsGroup.position.set(0, 0, 0)
            physicsGroup.rotation.z = 0
            physicsGroup.scale.set(1, 1, 1)
            if (visualGroup) {
              visualGroup.rotation.y = 0
            }
          }
          if (Math.abs(motion.x) < 0.06 && Math.abs(motion.y) < 0.06) {
            motion.vx *= 0.78
            motion.velocityY *= 0.78
          }
        } else {
          settleFrames = 0
          returnStartedAt = 0
        }

        for (let index = 0; index < textures.length; index += 1) {
          const texture = textures[index]
          texture.offset.x = ((time * heroThreeConfig.textScrollSpeed) + index * 0.045) % 1
          const material = materials[index]
          material.opacity =
            heroThreeConfig.ribbonOpacity *
            (0.84 + Math.sin(time * 0.00065 + index * 0.82) * 0.05)
        }

        for (let index = impactParticles.length - 1; index >= 0; index -= 1) {
          const particle = impactParticles[index]
          particle.life += 1
          particle.velocityX *= particle.drag
          particle.velocityY *= particle.drag
          particle.velocityZ *= particle.drag
          particle.velocityY -= 0.0024
          particle.sprite.position.x += particle.velocityX
          particle.sprite.position.y += particle.velocityY
          particle.sprite.position.z += particle.velocityZ
          const opacity = Math.max(0, 1 - particle.life / particle.maxLife)
          particle.material.opacity = opacity
          particle.material.rotation += particle.spin
          particle.sprite.scale.multiplyScalar(0.996)

          if (particle.life >= particle.maxLife) {
            scene.remove(particle.sprite)
            particle.material.dispose()
            impactParticles.splice(index, 1)
          }
        }

        renderer.render(scene, camera)

        const isIdle =
          !motion.detached &&
          !motion.returning &&
          impactParticles.length === 0 &&
          Math.abs(motion.x) < 0.002 &&
          Math.abs(motion.y) < 0.002 &&
          Math.abs(motion.vx) < 0.002 &&
          Math.abs(motion.velocityY) < 0.002

        scheduleTick(isIdle ? idleLoopDelay : activeLoopDelay)
      }

      scheduleTick(0)
    })()

    return () => {
      disposed = true
      if (tickTimerId !== null) {
        window.clearTimeout(tickTimerId)
        tickTimerId = null
      }
      observer?.disconnect()
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((materialItem) => materialItem.dispose())
      textures.forEach((texture) => texture.dispose())
      ribbonMeshes.length = 0
      impactParticles.forEach((particle) => {
        scene?.remove(particle.sprite)
        particle.material.dispose()
      })
      fragmentTextureCache.forEach((texture) => texture.dispose())
      collisionShell?.geometry.dispose()
      const collisionMaterial = collisionShell?.material
      if (collisionMaterial && !Array.isArray(collisionMaterial)) {
        collisionMaterial.dispose()
      }
      renderer?.dispose()
    }
  }, [enabled])

  return (
    <div className="three-sphere-scene" aria-hidden="true">
      <canvas ref={canvasRef} className="three-sphere-scene__canvas" />
    </div>
  )
}
