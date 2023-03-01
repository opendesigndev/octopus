/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it, vi, afterEach } from 'vitest'

import { ColorSpace, OctopusEffectColorFill } from '../octopus-effect-color-fill.js'
import { OctopusEffectGradientFill } from '../octopus-effect-fill-gradient.js'
import { OctopusEffectImageFill } from '../octopus-effect-fill-image.js'
import { OctopusEffectsShape } from '../octopus-effects-shape.js'

vi.mock('../octopus-effect-color-fill')
vi.mock('../octopus-effect-fill-gradient')
vi.mock('../octopus-effect-fill-image')

describe('OctopusEffectsShape', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('convert', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    it('returns fill from OctopusEffectImageFill when sourceLayer type is Image ', () => {
      const input: any = {
        parent: {},
        sourceLayer: { type: 'Image' },
      }

      const octopusImageFillConvert = {}
      vi.mocked(OctopusEffectImageFill).mockReturnValueOnce({
        convert: () => octopusImageFillConvert,
      } as any)

      const instance = new OctopusEffectsShape(input)

      const result = instance.convert()
      expect(result).toEqual({ fills: [{}] })
      expect(result?.fills?.[0]).toBe(octopusImageFillConvert)
    })

    it('returns fills OctopusEffectColorFill and OctopusEffectGradientFill when sourceLayer type is not Image ', () => {
      const input: any = {
        parent: {},
        sourceLayer: { type: 'Shading', hasFill: true },
      }

      const octopusEffectColorFillConvert = {}
      const octopusEffectColorFillInstance: any = {
        convert: () => octopusEffectColorFillConvert,
      }

      vi.mocked(OctopusEffectColorFill).mockReturnValueOnce(octopusEffectColorFillInstance)

      const octopusEffectGradientFillConvert = {}
      const octopusEffectGradientFillInstance: any = {
        convert: () => octopusEffectGradientFillConvert,
      } as any
      vi.mocked(OctopusEffectGradientFill).mockReturnValueOnce(octopusEffectGradientFillInstance)

      const instance = new OctopusEffectsShape(input)
      instance['_parseSourceLayerShapeFills'] = vi
        .fn()
        .mockReturnValueOnce([octopusEffectColorFillInstance, octopusEffectGradientFillInstance])

      const result = instance.convert()
      expect(result).toEqual({ fills: [{}, {}] })
      expect(result?.fills?.[0]).toBe(octopusEffectColorFillConvert)
      expect(result?.fills?.[1]).toBe(octopusEffectGradientFillConvert)
    })
  })

  describe('_parseSourceLayerShapeFills', () => {
    it('creates array of fills with OctopusEffectColorFill if hasFill is true and  sourceLayer.type==="Shading"', () => {
      const input: any = {
        parent: {},
        resources: { getColorSpaceValue: () => 'ColorSpaceValue' },
        sourceLayer: { type: 'Shading', hasFill: true },
      }
      const instance = new OctopusEffectsShape(input)
      const octopusEffectColorFillInstance: any = {}
      const octopusEffectGradientFillInstance: any = {}

      vi.mocked(OctopusEffectColorFill).mockReturnValueOnce(octopusEffectColorFillInstance)
      vi.mocked(OctopusEffectGradientFill).mockReturnValueOnce(octopusEffectGradientFillInstance)

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
