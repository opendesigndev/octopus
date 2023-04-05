import { isFiniteNumber, isString, isObject } from '../common'

describe('isFiniteNumber', () => {
  function testExample(value: unknown, result: boolean): void {
    test(`isFiniteNumber(${value}) to be ${result}`, () => {
      expect(isFiniteNumber(value)).toBe(result)
    })
  }

  type Example = [unknown, boolean]
  const examples: Example[] = [
    [0, true],
    [15, true],
    [-15, true],
    [0.7071067811865475, true],
    [1234567890123456, true],
    [9876543210123456, true],
    [Number.MAX_SAFE_INTEGER, true],
    ['42', false],
    [null, false],
    [undefined, false],
    [NaN, false],
    [Number.POSITIVE_INFINITY, false],
    [Number.NEGATIVE_INFINITY, false],
  ]
  examples.forEach((example) => testExample(...example))
})

describe('isString', () => {
  function testExample(value: unknown, result: boolean): void {
    test(`isString(${value}) to be ${result}`, () => {
      expect(isString(value)).toBe(result)
    })
  }

  type Example = [unknown, boolean]
  const examples: Example[] = [
    ['Hello', true],
    ['42', true],
    [42, false],
    ['', true],
    [null, false],
    [undefined, false],
    [NaN, false],
  ]
  examples.forEach((example) => testExample(...example))
})

describe('isObject', () => {
  function testExample(value: unknown, result: boolean): void {
    test(`isObject(${value}) to be ${result}`, () => {
      expect(isObject(value)).toBe(result)
    })
  }

  type Example = [unknown, boolean]
  const examples: Example[] = [
    [{ hello: 'world' }, true],
    [{}, true],
    ['Hello', false],
    [42, false],
    [null, false],
    [undefined, false],
    [NaN, false],
  ]
  examples.forEach((example) => testExample(...example))
})
