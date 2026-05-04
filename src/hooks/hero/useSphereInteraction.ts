import { useMemo, useState } from 'react'

type Point = {
  x: number
  y: number
}

type SphereInteractionState = {
  distance: number
  angle: number
  snapped: boolean
}

type UseSphereInteractionOptions = {
  center?: Point
  radius?: number
  lockRadius?: number
}

function calcDistance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function calcAngle(a: Point, b: Point) {
  return Math.atan2(b.y - a.y, b.x - a.x)
}

export function useSphereInteraction({
  center = { x: 0, y: 0 },
  radius = 0,
  lockRadius = radius * 1.1,
}: UseSphereInteractionOptions = {}) {
  const [cursor, setCursor] = useState<Point>({ x: 0, y: 0 })

  const state = useMemo<SphereInteractionState>(() => {
    const distance = calcDistance(center, cursor)
    const angle = calcAngle(center, cursor)
    const snapped = radius > 0 && distance >= lockRadius && distance <= lockRadius * 1.25

    return {
      distance,
      angle,
      snapped,
    }
  }, [center, cursor, lockRadius, radius])

  return {
    cursor,
    setCursor,
    state,
  }
}
