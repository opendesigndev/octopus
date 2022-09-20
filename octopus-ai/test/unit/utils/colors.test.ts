/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '../../../src/services/instances/logger'
import { getColorSpaceName, guessColorSpaceByComponents } from '../../../src/utils/colors'

jest.mock('../../../src/services/instances/logger')

describe('utils/colors', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getColorSpaceName', () => {
    it('returns argument when argument is typeof string', () => {
      const expected = 'expected'
      expect(getColorSpaceName(expected)).toEqual(expected)
    })

    it('returns first member in argument when argument is typeof array and first element is typeof string', () => {
      const expected = 'expected'
      expect(getColorSpaceName([expected])).toEqual(expected)
    })

    it('returns first member in argument when argument is typeof array and first element is typeof string', () => {
      const expected = 'expected'
      expect(getColorSpaceName([expected])).toEqual(expected)
    })

    it('returns null and calls logger warn when argument is not typeof string or first element in argument is not string', () => {
      const expected = null
      expect(getColorSpaceName([1] as any)).toEqual(expected)
      expect(logger.warn).toHaveBeenCalled()
    })
  })

  describe('guessColorSpaceByComponents', () => {
    it('multiplies by 255 first value when input array length is', () => {
      const expected = [100, 100, 100]
      expect(guessColorSpaceByComponents([100 / 255])).toEqual(expected)
    })

    it('multiplies by 255 all array values when input array length is 3', () => {
      const expected = [100, 200, 250]
      expect(guessColorSpaceByComponents([100 / 255, 200 / 255, 250 / 255])).toEqual(expected)
    })

    it('converts cmyk color to rgb when array input length is 4', () => {
      const expected = [163, 143, 122]
      expect(guessColorSpaceByComponents([0.2, 0.3, 0.4, 0.2])).toEqual(expected)
    })

    it('returns black color array when input length is not 1, 3 or 4', () => {
      const expected = [0, 0, 0]
      expect(guessColorSpaceByComponents([1, 2])).toEqual(expected)
      expect(logger.warn).toHaveBeenCalled()
    })
  })
})
