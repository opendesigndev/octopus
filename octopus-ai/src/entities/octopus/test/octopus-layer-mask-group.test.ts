/* eslint-disable @typescript-eslint/no-explicit-any */

import { OctopusLayerMaskGroup } from '../octopus-layer-mask-group'

function getTestingMaskGroup() {
  const options: any = {
    parent: {},
    layerSequences: [
      {
        sourceLayers: [
          {
            mask: {
              parentArtboard: { uniqueId: () => 1 },
              mask: {},
            },
          },
        ],
      },
    ],
  }

  return new OctopusLayerMaskGroup(options)
}

describe('OctopusLayerMaskGroup', () => {
  describe('_normalizeRectSubpaths', () => {
    it('normalizes all rect subpaths to have same corner directions', () => {
      const rectSubpaths = [
        { rectangle: { x0: 10, x1: 20, y0: 10, y1: 20 } },
        { rectangle: { x1: 10, x0: 20, y1: 10, y0: 20 } },
        { rectangle: { x0: 10, x1: 20, y1: 10, y0: 20 } },
      ]

      const expected = [
        { x0: 10, x1: 20, y0: 10, y1: 20 },
        { x0: 10, x1: 20, y0: 10, y1: 20 },
        { x0: 10, x1: 20, y0: 10, y1: 20 },
      ]

      const maskGroup = getTestingMaskGroup()

      expect(maskGroup['_normalizeRectSubpaths'](rectSubpaths as any)).toEqual(expected)
    })
  })

  describe('_createIntersectionFromRectangles', () => {
    it('creates intersection from rectangles', () => {
      const rectSubpaths = [
        { x0: 10, x1: 20, y0: 10, y1: 20 },
        { x0: 15, x1: 20, y0: 10, y1: 20 },
        { x0: 10, x1: 25, y0: 18, y1: 20 },
      ]

      const maskGroup = getTestingMaskGroup()

      expect(maskGroup['_createIntersectionFromRectangles'](rectSubpaths)).toEqual({ x0: 15, x1: 20, y0: 18, y1: 10 })
    })
  })

  describe('_isMaskValid', () => {
    it('returns true when mask.shape.path.type is not COMPOUND', () => {
      const maskGroup = getTestingMaskGroup()
      const mask: any = { shape: { path: { type: 'RECT' } } }
      expect(maskGroup['_isMaskValid'](mask)).toEqual(true)
    })

    it('returns true when subpaths are not only rects', () => {
      const maskGroup = getTestingMaskGroup()
      const mask: any = { shape: { path: { type: 'COMPOUND' } } }
      maskGroup['_doesPathConsistsOnlyFromRectSubpaths'] = jest.fn().mockReturnValueOnce(false)

      expect(maskGroup['_isMaskValid'](mask)).toEqual(true)
    })

    it('returns true when subpaths are not rects only', () => {
      const maskGroup = getTestingMaskGroup()
      const mask: any = { shape: { path: { type: 'COMPOUND' } } }

      maskGroup['_doesPathConsistsOnlyFromRectSubpaths'] = jest.fn().mockReturnValueOnce(false)
      expect(maskGroup['_isMaskValid'](mask)).toEqual(true)
    })

    it('returns false when x0 > x1', () => {
      const maskGroup = getTestingMaskGroup()
      const mask: any = { shape: { path: { type: 'COMPOUND' } } }
      maskGroup['_normalizeRectSubpaths'] = jest.fn()
      maskGroup['_doesPathConsistsOnlyFromRectSubpaths'] = jest.fn().mockReturnValueOnce(true)
      maskGroup['_createIntersectionFromRectangles'] = jest.fn().mockReturnValueOnce({ x0: 11, x1: 10, y1: 11, y0: 10 })
      expect(maskGroup['_isMaskValid'](mask)).toEqual(false)
    })

    it('returns false when y0 > y1', () => {
      const maskGroup = getTestingMaskGroup()
      const mask: any = { shape: { path: { type: 'COMPOUND' } } }
      maskGroup['_normalizeRectSubpaths'] = jest.fn()
      maskGroup['_doesPathConsistsOnlyFromRectSubpaths'] = jest.fn().mockReturnValueOnce(true)
      maskGroup['_createIntersectionFromRectangles'] = jest.fn().mockReturnValueOnce({ x0: 10, x1: 11, y1: 10, y0: 11 })
      expect(maskGroup['_isMaskValid'](mask)).toEqual(false)
    })

    it('returns true when y0 < y1 && x0 < x1', () => {
      const maskGroup = getTestingMaskGroup()
      const mask: any = { shape: { path: { type: 'COMPOUND' } } }
      maskGroup['_normalizeRectSubpaths'] = jest.fn()
      maskGroup['_doesPathConsistsOnlyFromRectSubpaths'] = jest.fn().mockReturnValueOnce(true)
      maskGroup['_createIntersectionFromRectangles'] = jest.fn().mockReturnValueOnce({ x0: 10, x1: 11, y1: 11, y0: 10 })
      expect(maskGroup['_isMaskValid'](mask)).toEqual(true)
    })
  })
})
