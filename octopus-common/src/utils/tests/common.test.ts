/* eslint-disable no-prototype-builtins */
import { removeUndefined } from '../common'

describe('removeUndefined', () => {
  const example = {
    prop1: null,
    prop2: undefined,
    prop3: { inner1: null, inner2: undefined, inner3: '' },
    prop4: '',
  }

  test(`hasOwnProperty`, () => {
    expect(example.hasOwnProperty('prop1')).toBe(true)
    expect(example.hasOwnProperty('prop2')).toBe(true)
    expect(example.hasOwnProperty('prop3')).toBe(true)
    expect(example.hasOwnProperty('prop4')).toBe(true)
    expect(example.hasOwnProperty('prop5')).toBe(false)

    expect(example.prop3.hasOwnProperty('inner1')).toBe(true)
    expect(example.prop3.hasOwnProperty('inner2')).toBe(true)
    expect(example.prop3.hasOwnProperty('inner3')).toBe(true)
    expect(example.prop3.hasOwnProperty('inner4')).toBe(false)

    const after = removeUndefined(example)

    expect(after.hasOwnProperty('prop1')).toBe(true)
    expect(after.hasOwnProperty('prop2')).toBe(false) // here
    expect(after.hasOwnProperty('prop3')).toBe(true)
    expect(after.hasOwnProperty('prop4')).toBe(true)
    expect(after.hasOwnProperty('prop5')).toBe(false)

    expect(after.prop3.hasOwnProperty('inner1')).toBe(true)
    expect(after.prop3.hasOwnProperty('inner2')).toBe(false) // here
    expect(after.prop3.hasOwnProperty('inner3')).toBe(true)
    expect(after.prop3.hasOwnProperty('inner4')).toBe(false)
  })
})
