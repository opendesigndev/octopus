import { getArtboardColor, getLayerBounds } from '../source.js'

describe('src/utils/source', () => {
  describe(getArtboardColor.name, () => {
    it('returns white color when type background type is 1', () => {
      expect(getArtboardColor(1, undefined)).toEqual({ b: 255, g: 255, r: 255 })
    })

    it('returns black color when type background type is 2', () => {
      expect(getArtboardColor(2, undefined)).toEqual({ b: 0, g: 0, r: 0 })
    })

    it('returns null when type background type is 3', () => {
      expect(getArtboardColor(3, undefined)).toEqual(null)
    })

    it('returns color when type background type is 4', () => {
      expect(getArtboardColor(4, { Rd: 200, Grn: 100 })).toEqual({ r: 200, g: 100, b: 0 })
    })
  })

  describe(getLayerBounds.name, () => {
    it('returns parsed bounds and checks for nullish values', () => {
      expect(
        getLayerBounds({
          top: 10,
          height: 15,
          left: 20,
        })
      ).toEqual({
        height: 15,
        left: 20,
        right: 20,
        top: 10,
        width: 0,
        bottom: 25,
      })
    })
  })
})
