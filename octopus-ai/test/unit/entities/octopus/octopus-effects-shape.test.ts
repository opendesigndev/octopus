/* eslint-disable @typescript-eslint/no-explicit-any */

import { mocked } from 'jest-mock'

import { ColorSpace, OctopusEffectColorFill } from '../../../../src/entities/octopus/octopus-effect-color-fill'
import { OctopusEffectGradientFill } from '../../../../src/entities/octopus/octopus-effect-fill-gradient'
import { OctopusEffectImageFill } from '../../../../src/entities/octopus/octopus-effect-fill-image'
import { OctopusEffectsShape } from '../../../../src/entities/octopus/octopus-effects-shape'

jest.mock('../../../../src/entities/octopus/octopus-effect-color-fill')
jest.mock('../../../../src/entities/octopus/octopus-effect-fill-gradient')
jest.mock('../../../../src/entities/octopus/octopus-effect-fill-image')

describe('entities/octopus/octopus-effects-shape', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('convert', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('returns fill from OctopusEffectImageFill when sourceLayer type is Image ', () => {
      const input: any = {
        parent: {},
        sourceLayer: { type: 'Image' },
      }

      const octopusImageFillConvert = {}
      mocked(OctopusEffectImageFill).mockReturnValueOnce({
        convert: () => octopusImageFillConvert,
      } as any)

      const instance = new OctopusEffectsShape(input)

      const result = instance.convert()
      expect(result).toEqual({ fills: [{}] })
      expect(result?.fills?.[0]).toBe(octopusImageFillConvert)
    })

    it('returns fills OctopusEffectColorFill and/or OctopusEffectGradientFill when sourceLayer type is not Image ', () => {
      const input: any = {
        parent: {},
        sourceLayer: { type: 'Shading', hasFill: true },
      }

      const octopusEffectColorFillConvert = {}
      const octopusEffectColorFillInstance: any = {
        convert: () => octopusEffectColorFillConvert,
      }

      mocked(OctopusEffectColorFill).mockReturnValueOnce(octopusEffectColorFillInstance)

      const octopusEffectGradientFillConvert = {}
      const octopusEffectGradientFillInstance: any = {
        convert: () => octopusEffectGradientFillConvert,
      } as any
      mocked(OctopusEffectGradientFill).mockReturnValueOnce(octopusEffectGradientFillInstance)

      const instance = new OctopusEffectsShape(input)
      instance['_parseSourceLayerShapeFills'] = jest
        .fn()
        .mockReturnValueOnce([octopusEffectColorFillInstance, octopusEffectGradientFillInstance])

      const result = instance.convert()
      expect(result).toEqual({ fills: [{}, {}] })
      expect(result?.fills?.[0]).toBe(octopusEffectColorFillConvert)
      expect(result?.fills?.[1]).toBe(octopusEffectGradientFillConvert)
    })
  })

  describe('_parseSourceLayerShapeFills', () => {
    it('creates array of fills with OctopusEffectColorFill if hasFill is true and OctopusEffectGradientFill if sourceLayer.type==="Shading"', () => {
      const input: any = {
        parent: {},
        resources: { getColorSpaceValue: () => 'ColorSpaceValue' },
        sourceLayer: { type: 'Shading', hasFill: true },
      }
      const instance = new OctopusEffectsShape(input)
      const octopusEffectColorFillInstance: any = {}
      const octopusEffectGradientFillInstance: any = {}

      mocked(OctopusEffectColorFill).mockReturnValueOnce(octopusEffectColorFillInstance)
      mocked(OctopusEffectGradientFill).mockReturnValueOnce(octopusEffectGradientFillInstance)

      const expected = [octopusEffectColorFillInstance, octopusEffectGradientFillInstance]
      const result = instance['_parseSourceLayerShapeFills'](input.sourceLayer as any)
      expect(result.length).toEqual(2)
      expect(result[0]).toBe(expected[0])
      expect(result[1]).toBe(expected[1])

      expect(OctopusEffectColorFill).toHaveBeenCalledWith({
        colorSpaceValue: 'ColorSpaceValue',
        sourceLayer: input.sourceLayer,
        colorSpaceType: ColorSpace.NON_STROKING,
      })

      expect(OctopusEffectGradientFill).toHaveBeenCalledWith({
        resources: input.resources,
        sourceLayer: input.sourceLayer,
      })
    })
  })
})
