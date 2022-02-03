import { getLinearGradientPoints, LinearGradientPointsParams } from './gradient'

describe('getLinearGradientPoints', () => {
  test(`angle: 0`, () => {
    const example = { angle: 0, scale: 0, inverse: false }
    const result = [
      { x: 0, y: 0.5 },
      { x: 1, y: 0.5 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 15`, () => {
    const example = { angle: 15, scale: 0, inverse: false }
    const result = [
      { x: 0, y: 0.6339745962155614 },
      { x: 1, y: 0.36602540378443865 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 45`, () => {
    const example = { angle: 45, scale: 0, inverse: false }
    const result = [
      { x: 5.551115123125783e-17, y: 1 },
      { x: 1, y: 0 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 50`, () => {
    const example = { angle: 50, scale: 0, inverse: false }
    const result = [
      { x: 0.08045018441136004, y: 1 },
      { x: 0.9195498155886399, y: 0 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 90`, () => {
    const example = { angle: 90, scale: 0, inverse: false }
    const result = [
      { x: 0.5, y: 1 },
      { x: 0.5, y: 0 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 100`, () => {
    const example = { angle: 100, scale: 0, inverse: false }
    const result = [
      { x: 0.5881634903542325, y: 1 },
      { x: 0.4118365096457675, y: 0 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 135`, () => {
    const example = { angle: 135, scale: 0, inverse: false }
    const result = [
      { x: 1, y: 1 },
      { x: 0, y: -1.1102230246251565e-16 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 170`, () => {
    const example = { angle: 170, scale: 0, inverse: false }
    const result = [
      { x: 1, y: 0.5881634903542324 },
      { x: 0, y: 0.41183650964576757 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 180`, () => {
    const example = { angle: 180, scale: 0, inverse: false }
    const result = [
      { x: 1, y: 0.5 },
      { x: 0, y: 0.5 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })
})
