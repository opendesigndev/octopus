import { describe, expect, test } from 'vitest'

import { cos, invLerp, lerp, mod, sin, tan } from '../math'

describe('mod', () => {
  function testModulo(N: number, modulo: number, result: number): void {
    test(`mod(${N}, ${modulo}) to be ${result}`, () => {
      expect(mod(N, modulo)).toBe(result)
    })
  }

  type Example = [number, number, number]
  const examples: Example[] = [
    [0, 1, 0],
    [0, 2, 0],
    [1, 1, 0],
    [2, 5, 2],
    [11, 5, 1],
    [11, -5, 1],
    [-11, 5, 4],
    [-15, 360, 345],
    [-60, 360, 300],
  ]

  examples.forEach((example) => testModulo(...example))
})

describe('sin', () => {
  function testTan(N: number, result: number): void {
    test(`sin(${N}) to be ${result}`, () => {
      expect(sin(N)).toBe(result)
    })
  }

  type Example = [number, number]
  const examples: Example[] = [
    [0, 0],
    [15, 0.25881904510252074],
    [30, 0.49999999999999994],
    [45, 0.7071067811865475],
    [90, 1],
    [360, -2.4492935982947064e-16],
    [-15, -0.25881904510252074],
    [-360, 2.4492935982947064e-16],
  ]

  examples.forEach((example) => testTan(...example))
})

describe('cos', () => {
  function testTan(N: number, result: number): void {
    test(`cos(${N}) to be ${result}`, () => {
      expect(cos(N)).toBe(result)
    })
  }

  type Example = [number, number]
  const examples: Example[] = [
    [0, 1],
    [15, 0.9659258262890683],
    [30, 0.8660254037844387],
    [45, 0.7071067811865476],
    [60, 0.5000000000000001],
    [90, 6.123233995736766e-17],
    [360, 1],
    [-15, 0.9659258262890683],
    [-360, 1],
  ]

  examples.forEach((example) => testTan(...example))
})

describe('tan', () => {
  function testTan(N: number, result: number): void {
    test(`tan(${N}) to be ${result}`, () => {
      expect(tan(N)).toBe(result)
    })
  }

  type Example = [number, number]
  const examples: Example[] = [
    [0, 0],
    [15, 0.2679491924311227],
    [30, 0.5773502691896257],
    [45, 0.9999999999999999],
    [90, 16331239353195370],
    [360, -2.4492935982947064e-16],
    [-15, -0.2679491924311227],
    [-360, 2.4492935982947064e-16],
  ]

  examples.forEach((example) => testTan(...example))
})

describe('lerp', () => {
  function testTan(x: number, y: number, ratio: number, result: number): void {
    test(`lerp(${x}, ${y}, ${ratio}) to be ${result}`, () => {
      expect(lerp(x, y, ratio)).toBe(result)
    })
  }

  type Example = [number, number, number, number]
  const examples: Example[] = [
    [0, 1, 0.5, 0.5],
    [10, 20, 0.5, 15],
    [2, 12, 0.2, 4],
    [-10, 10, 0.5, 0],
    [0, 1, 2, 2],
    [1, 0, 2, -1],
  ]

  examples.forEach((example) => testTan(...example))
})

describe('invLerp', () => {
  function testTan(x: number, y: number, ratio: number, result: number): void {
    test(`invLerp(${x}, ${y}, ${ratio}) to be ${result}`, () => {
      expect(invLerp(x, y, ratio)).toBe(result)
    })
  }

  type Example = [number, number, number, number]
  const examples: Example[] = [
    [0, 1, 0.5, 0.5],
    [10, 20, 15, 0.5],
    [2, 12, 4, 0.2],
    [-10, 10, 0, 0.5],
    [0, 1, 2, 2],
    [1, 0, -1, 2],
  ]

  examples.forEach((example) => testTan(...example))
})
