import { asFiniteNumber } from '../as'

describe('asFiniteNumber', () => {
  function testExample(value: unknown, defaultValue: number | undefined, result: number): void {
    test(`asFiniteNumber(${value}) to be ${result}`, () => {
      expect(asFiniteNumber(value, defaultValue)).toBe(result)
    })
  }

  type Example = [unknown, number | undefined, number]
  const examples: Example[] = [
    [0, 42, 0],
    [15, 42, 15],
    [-15, 42, -15],
    [0.7071067811865475, 42, 0.7071067811865475],
    [9876543210123456, 42, 9876543210123456],
    [Number.MAX_SAFE_INTEGER, 42, Number.MAX_SAFE_INTEGER],
    ['24', 42, 42],
    ['24', undefined, 24],
    [null, 42, 42],
    [undefined, 42, 42],
    [NaN, 42, 42],
    [Number.POSITIVE_INFINITY, 42, 42],
    [Number.NEGATIVE_INFINITY, 42, 42],
  ]

  examples.forEach((example) => testExample(...example))
})