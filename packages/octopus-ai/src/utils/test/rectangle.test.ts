import { parseRect } from '../rectangle.js'

describe('utils/rectangle', () => {
  it('calculates rectangle coords where width>height', () => {
    const x = 5
    const y = 6
    const width = 20
    const height = 10
    const coords = [x, y, width, height]

    const expected = { rectangle: { x0: 5, x1: 25, y0: 6, y1: 16 }, type: 'RECTANGLE' }

    expect(parseRect(coords)).toEqual(expected)
  })

  it('calculates rectangle coords where height>width', () => {
    const x = 5
    const y = 6
    const height = 20
    const width = 10
    const coords = [x, y, width, height]

    const expected = { rectangle: { x0: 5, x1: 15, y0: 6, y1: 26 }, type: 'RECTANGLE' }

    expect(parseRect(coords)).toEqual(expected)
  })
})
