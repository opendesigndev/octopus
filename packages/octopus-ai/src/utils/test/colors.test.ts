/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, afterEach } from 'vitest'

import { getColorSpaceName, guessColorSpaceByComponents, convertColor } from '../colors.js'

describe('utils/colors', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getColorSpaceName', () => {
    it('returns input when input is typeof string', () => {
      const expected = 'DeviceRGB'
      expect(getColorSpaceName(expected)).toEqual(expected)
    })

    it('returns first member in input when input is typeof array and first element is typeof string', () => {
      const expected = 'DeviceRGB'
      expect(getColorSpaceName([expected])).toEqual(expected)
    })

    it('returns first member in input when input is typeof array and first element is typeof string', () => {
      const expected = 'DeviceRGB'
      expect(getColorSpaceName([expected])).toEqual(expected)
    })

    it('returns null and calls logger warn when input is not typeof string and first element in input is not string', () => {
      const expected = null
      expect(getColorSpaceName([1] as any)).toEqual(expected)
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
    })
  })

  describe('convertColor', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('returns RGB colors same as input color when color is of length 3 and colorSpace name is DeviceRGB', () => {
      const color = [1, 1, 1]
      const colorSpace = 'DeviceRGB'
      expect(convertColor(color, colorSpace)).toEqual(color)
    })

    it('returns RGB colors with same value as first value in input color when color is of length 1 and colorSpace name is DeviceRGB', () => {
      const color = [1]
      const colorSpace = 'DeviceRGB'

      expect(convertColor(color, colorSpace)).toEqual([1, 1, 1])
    })

    it('returns RGB colors calculated to CMYK if color length is 4 and colorSpace name is DeviceRGB', () => {
      const expected = [163 / 255, 143 / 255, 122 / 255]

      expect(convertColor([0.2, 0.3, 0.4, 0.2], 'DeviceRGB')).toEqual(expected)
    })

    it('returns RGB colors calculated to black if color length is 2 and colorSpace name is DeviceRGB', () => {
      const expected = [0, 0, 0]

      expect(convertColor([0.2, 1], 'DeviceRGB')).toEqual(expected)
    })

    it('returns RGB colors same as input color when color is of length 3 and colorSpace name is DeviceCMYK', () => {
      const color = [1, 1, 1]
      const colorSpace = 'DeviceCMYK'
      expect(convertColor(color, colorSpace)).toEqual(color)
    })

    it('returns RGB colors with same value as first value in input color when color is of length 1 and colorSpace name is DeviceCMYK', () => {
      const color = [1]
      const colorSpace = 'DeviceCMYK'

      expect(convertColor(color, colorSpace)).toEqual([1, 1, 1])
    })

    it('returns RGB colors calculated to CMYK if color length is 4 and colorSpace name is DeviceCMYK', () => {
      const expected = [163 / 255, 143 / 255, 122 / 255]

      expect(convertColor([0.2, 0.3, 0.4, 0.2], 'DeviceCMYK')).toEqual(expected)
    })

    it('returns RGB colors calculated to black if color length is 2 and colorSpace name is DeviceCMYK', () => {
      const expected = [0, 0, 0]

      expect(convertColor([0.2, 1], 'DeviceCMYK')).toEqual(expected)
    })

    it('returns RGB colors same as input color when color is of length 3 and colorSpace name is DeviceGray', () => {
      const color = [1, 1, 1]
      const colorSpace = 'DeviceGray'
      expect(convertColor(color, colorSpace)).toEqual(color)
    })

    it('returns RGB colors with same value as first value in input color when color is of length 1 and colorSpace name is DeviceGray', () => {
      const color = [1]
      const colorSpace = 'DeviceGray'

      expect(convertColor(color, colorSpace)).toEqual([1, 1, 1])
    })

    it('returns RGB colors calculated to CMYK if color length is 4 and colorSpace name is DeviceGray', () => {
      const expected = [163 / 255, 143 / 255, 122 / 255]

      expect(convertColor([0.2, 0.3, 0.4, 0.2], 'DeviceGray')).toEqual(expected)
    })

    it('returns RGB colors calculated to black if color length is 2 and colorSpace name is DeviceGray', () => {
      const expected = [0, 0, 0]

      expect(convertColor([0.2, 1], 'DeviceGray')).toEqual(expected)
    })

    it('returns RGB colors same as input color when color is of length 3 and colorSpace name is ICCBased', () => {
      const color = [1, 1, 1]
      const colorSpace = 'ICCBased'
      expect(convertColor(color, colorSpace)).toEqual(color)
    })

    it('returns RGB colors with same value as first value in input color when color is of length 1 and colorSpace name is ICCBased', () => {
      const color = [1]
      const colorSpace = 'ICCBased'
      const expected = [1, 1, 1]
      expect(convertColor(color, colorSpace)).toEqual(expected)
    })

    it('returns RGB colors calculated to CMYK if color length is 4 and colorSpace name is ICCBased', () => {
      const expected = [163 / 255, 143 / 255, 122 / 255]

      expect(convertColor([0.2, 0.3, 0.4, 0.2], 'ICCBased')).toEqual(expected)
    })

    it('returns RGB colors calculated to black if color length is 2 and colorSpace name is ICCBased', () => {
      const expected = [0, 0, 0]

      expect(convertColor([0.2, 1], 'ICCBased')).toEqual(expected)
    })

    it('returns RGB colors same as input color when color is of length 3 and colorSpace name is unknown', () => {
      const color = [1, 1, 1]
      const colorSpace = ''
      expect(convertColor(color, colorSpace)).toEqual(color)
    })

    it('returns RGB colors with same value as first value in input color when color is of length 1 and colorSpace name is unknown', () => {
      const color = [1]
      const colorSpace = ''

      expect(convertColor(color, colorSpace)).toEqual([1, 1, 1])
    })

    it('returns RGB colors calculated to CMYK if color length is 4 and colorSpace name is unknown', () => {
      const expected = [163 / 255, 143 / 255, 122 / 255]

      expect(convertColor([0.2, 0.3, 0.4, 0.2], '')).toEqual(expected)
    })

    it('returns RGB colors calculated to black if color length is 2 and colorSpace name is unknown', () => {
      const expected = [0, 0, 0]

      expect(convertColor([0.2, 1], '')).toEqual(expected)
    })
  })
})
