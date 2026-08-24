import { describe, expect, it } from 'vitest'
import { clampTransform, coverScale, zoomAroundPoint } from './geometry'

const canvas = { width: 1080, height: 1080 }
const portrait = { width: 800, height: 1200 }

describe('coverScale', () => {
  it('covers the square without leaving empty edges', () => {
    expect(coverScale(portrait, canvas)).toBeCloseTo(1.35)
  })
})

describe('clampTransform', () => {
  it('centers an image when it cannot move on an axis', () => {
    const result = clampTransform(
      { x: 500, y: 0, scale: 1.35 },
      portrait,
      canvas,
      1.35,
    )

    expect(result.x).toBe(0)
  })

  it('limits movement to the scaled image edges', () => {
    const result = clampTransform(
      { x: 0, y: 900, scale: 1.35 },
      portrait,
      canvas,
      1.35,
    )

    expect(result.y).toBe(270)
  })

  it('never allows a scale below cover scale', () => {
    const result = clampTransform(
      { x: 0, y: 0, scale: 0.5 },
      portrait,
      canvas,
      1.35,
    )

    expect(result.scale).toBe(1.35)
  })
})

describe('zoomAroundPoint', () => {
  it('keeps the selected canvas point visually anchored', () => {
    const result = zoomAroundPoint(
      { x: 0, y: 0, scale: 1 },
      2,
      { x: 200, y: 300 },
    )

    expect(result).toEqual({ x: -200, y: -300, scale: 2 })
  })
})
