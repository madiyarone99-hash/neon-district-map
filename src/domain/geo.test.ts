import { describe, expect, it } from 'vitest'
import {
  centroidOfRing,
  closeRing,
  formatDistance,
  haversineMeters,
  ringAreaSqm,
  walkingMinutes,
} from './geo'

describe('geo', () => {
  it('measures a known short distance in Astana', () => {
    const a: [number, number] = [71.43, 51.128]
    const b: [number, number] = [71.431, 51.128]
    const meters = haversineMeters(a, b)
    expect(meters).toBeGreaterThan(60)
    expect(meters).toBeLessThan(90)
  })

  it('closes an open ring without duplicating a closed one', () => {
    const open: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
    ]
    const closed = closeRing(open)
    expect(closed[closed.length - 1]).toEqual(open[0])
    expect(closeRing(closed)).toHaveLength(closed.length)
  })

  it('computes a simple centroid', () => {
    expect(
      centroidOfRing([
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2],
        [0, 0],
      ]),
    ).toEqual([1, 1])
  })

  it('formats walking distances', () => {
    expect(formatDistance(240)).toBe('240 м')
    expect(formatDistance(1600)).toBe('1.6 км')
  })

  it('estimates a real polygon area (≈300m × 200m square near Astana)', () => {
    const halfLon = 0.002165 // ≈150m at this latitude (cos(51.13°) ≈ 0.627)
    const halfLat = 0.0009 // ≈100m
    const lon = 71.43
    const lat = 51.128
    const ring: [number, number][] = [
      [lon - halfLon, lat - halfLat],
      [lon + halfLon, lat - halfLat],
      [lon + halfLon, lat + halfLat],
      [lon - halfLon, lat + halfLat],
    ]
    const area = ringAreaSqm(ring)
    expect(area).toBeGreaterThan(50_000)
    expect(area).toBeLessThan(70_000)
  })

  it('turns distance into a rounded walking time, never zero', () => {
    expect(walkingMinutes(80)).toBe(1)
    expect(walkingMinutes(40)).toBe(1)
    expect(walkingMinutes(800)).toBe(10)
  })
})
