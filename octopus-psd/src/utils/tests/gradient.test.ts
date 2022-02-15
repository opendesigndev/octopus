import { angleToPoints } from '../gradient'

describe('angleToPoints', () => {
  describe('canvas 1000x1000', () => {
    const width = 1000
    const height = 1000

    test(`angle: 0`, () => {
      const example = { angle: 0, width, height }
      const result = [
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 15`, () => {
      const example = { angle: 15, width, height }
      const result = [
        { x: 0, y: 0.634 },
        { x: 1, y: 0.366 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 45`, () => {
      const example = { angle: 45, width, height }
      const result = [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 50`, () => {
      const example = { angle: 50, width, height }
      const result = [
        { x: 0.08, y: 1 },
        { x: 0.92, y: 0 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 90`, () => {
      const example = { angle: 90, width, height }
      const result = [
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 100`, () => {
      const example = { angle: 100, width, height }
      const result = [
        { x: 0.588, y: 1 },
        { x: 0.412, y: 0 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 135`, () => {
      const example = { angle: 135, width, height }
      const result = [
        { x: 1, y: 1 },
        { x: 0, y: 0 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 170`, () => {
      const example = { angle: 170, width, height }
      const result = [
        { x: 1, y: 0.588 },
        { x: 0, y: 0.412 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 180`, () => {
      const example = { angle: 180, width, height }
      const result = [
        { x: 1, y: 0.5 },
        { x: 0, y: 0.5 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })
  })

  describe('canvas 1000x2000', () => {
    const width = 2000
    const height = 1000

    test(`angle: 0`, () => {
      const example = { angle: 0, width, height }
      const result = [
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 90`, () => {
      const example = { angle: 90, width, height }
      const result = [
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 180`, () => {
      const example = { angle: 180, width, height }
      const result = [
        { x: 1, y: 0.5 },
        { x: 0, y: 0.5 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: -90`, () => {
      const example = { angle: -90, width, height }
      const result = [
        { x: 0.5, y: 0 },
        { x: 0.5, y: 1 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 26.565`, () => {
      const example = { angle: 26.5651, width, height }
      const result = [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: -26.565`, () => {
      const example = { angle: -26.5651, width, height }
      const result = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })
  })

  describe('canvas 2000x1000', () => {
    const width = 1000
    const height = 2000

    test(`angle: 0`, () => {
      const example = { angle: 0, width, height }
      const result = [
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 90`, () => {
      const example = { angle: 90, width, height }
      const result = [
        { x: 0.5, y: 1 },
        { x: 0.5, y: 0 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 180`, () => {
      const example = { angle: 180, width, height }
      const result = [
        { x: 1, y: 0.5 },
        { x: 0, y: 0.5 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: -90`, () => {
      const example = { angle: -90, width, height }
      const result = [
        { x: 0.5, y: 0 },
        { x: 0.5, y: 1 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: 63.43`, () => {
      const example = { angle: 63.43, width, height }
      const result = [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })

    test(`angle: -63.43`, () => {
      const example = { angle: -63.43, width, height }
      const result = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]
      expect(angleToPoints(example)).toStrictEqual(result)
    })
  })
})
