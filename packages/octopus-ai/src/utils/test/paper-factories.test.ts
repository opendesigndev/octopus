import { createPath, createPoint, createSegment } from '../paper-factories.js'

describe('utils/paper-factories', () => {
  describe('create-point', () => {
    it('returns paper.Point', () => {
      const expected = ['Point', 10, 10]
      expect(JSON.stringify(createPoint(10, 10))).toEqual(JSON.stringify(expected))
    })
  })

  describe('createSegment', () => {
    it('returns paper.Segment', () => {
      const point = createPoint(10, 10)
      const handleIn = createPoint(20, 20)
      const handleOut = createPoint(30, 30)

      const expected = ['Segment', [10, 10], [20, 20], [30, 30]]
      expect(JSON.stringify(createSegment(point, handleIn, handleOut))).toEqual(JSON.stringify(expected))
    })
  })

  describe('createPath', () => {
    it('creates path', () => {
      const point1 = createPoint(10, 10)
      const point2 = createPoint(20, 20)
      const point3 = createPoint(30, 30)
      const expected = [
        'Path',
        {
          applyMatrix: true,
          segments: [
            [10, 10],
            [20, 20],
            [30, 30],
          ],
        },
      ]

      expect(JSON.stringify(createPath([point1, point2, point3]))).toEqual(JSON.stringify(expected))
    })
  })
})
