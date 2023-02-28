import { createShape } from '../create-shape.js'

import type { OctopusPoint } from '../create-shape.js'

describe('utils/create-shape', () => {
  it('returns closed paper.Path when closed input is true', () => {
    const points = [
      { type: 'point' as const, coordinates: [1, 2] },
      { type: 'bezier' as const, coordinates: [10, 20] },
    ]

    const expected = [
      'Path',
      {
        applyMatrix: true,
        segments: [
          [1, 2],
          [
            [0, 0],
            [10, 20],
            [0, 0],
          ],
        ],
        closed: true,
      },
    ]

    expect(JSON.stringify(createShape({ points, closed: true }))).toEqual(JSON.stringify(expected))
  })

  it('returns open paper.Path when closed input is false', () => {
    const points = [
      { type: 'point' as const, coordinates: [1, 2] },
      { type: 'bezier' as const, coordinates: [10, 20] },
    ]

    const expected = [
      'Path',
      {
        applyMatrix: true,
        segments: [
          [1, 2],
          [
            [0, 0],
            [10, 20],
            [0, 0],
          ],
        ],
      },
    ]

    expect(JSON.stringify(createShape({ points, closed: false }))).toEqual(JSON.stringify(expected))
  })

  it('returns null when there are no points', () => {
    const points: OctopusPoint[] = []
    const expected = null
    expect(JSON.stringify(createShape({ points, closed: false }))).toEqual(JSON.stringify(expected))
  })
})
