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
      { x: 0, y: 0.633974596215561 },
      { x: 1, y: 0.366025403784439 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 45`, () => {
    const example = { angle: 45, scale: 0, inverse: false }
    const result = [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 50`, () => {
    const example = { angle: 50, scale: 0, inverse: false }
    const result = [
      { x: 0.08045018441136, y: 1 },
      { x: 0.91954981558864, y: 0 },
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
      { x: 0.588163490354233, y: 1 },
      { x: 0.411836509645768, y: 0 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 135`, () => {
    const example = { angle: 135, scale: 0, inverse: false }
    const result = [
      { x: 1, y: 1 },
      { x: 0, y: -0 },
    ]
    expect(getLinearGradientPoints(example)).toStrictEqual(result)
  })

  test(`angle: 170`, () => {
    const example = { angle: 170, scale: 0, inverse: false }
    const result = [
      { x: 1, y: 0.588163490354232 },
      { x: 0, y: 0.411836509645768 },
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
