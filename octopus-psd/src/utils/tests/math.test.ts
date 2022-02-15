import { mod, tan } from '../math'

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
    [11, 5, 1],
    [-15, 360, 345],
    [-60, 360, 300],
  ]

  examples.forEach((example) => testModulo(...example))
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
  ]

  examples.forEach((example) => testTan(...example))
})
