import { createRectPoints, isValid } from '../../../src/utils/coords'

describe('utils/coords.', () => {
  describe('createRectpoints', () => {
    it('returns correct rectPoints', () => {
      const expected = [
        [1, 2],
        [4, 2],
        [4, 6],
        [1, 6],
      ]

      expect(createRectPoints([1, 2, 3, 4])).toEqual(expected)
    })

    it('parses coords when missing', () => {
      const expected = [
        [1, 2],
        [5, 2],
        [5, 2],
        [1, 2],
      ]

      expect(createRectPoints([1, 2, 4])).toEqual(expected)
    })
  })

  describe('isValid', () => {
    it('returns false when point does not have expected type', () => {
      const Type = ''

      expect(isValid({ Type, Coords: [] })).toEqual(false)
    })

    it('returns false when point does not have expected type', () => {
      const Type = ''
      const Coords: number[] = []

      expect(isValid({ Type, Coords })).toEqual(false)
    })

    describe('valid type', () => {
      const types = ['Curve', 'Line', 'Move']
      const Coords: number[] = []

      test.each(types)('returns true when point has %p type', (Type) => {
        expect(isValid({ Type, Coords })).toEqual(true)
      })

      test.each(types)('returns false when point has %p type and Coords are not defined', (Type) => {
        expect(isValid({ Type })).toEqual(false)
      })
    })
  })
})
