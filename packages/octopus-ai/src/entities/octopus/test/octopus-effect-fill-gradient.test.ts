/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest'

import { OctopusEffectGradientFill } from '../octopus-effect-fill-gradient.js'

import type { Coord } from '../../../typings/index.js'

describe('OctopusEffectGradientFill', () => {
  describe('_parseType2Function', () => {
    it('creates 2 gradientStops', () => {
      const octopusEffectGradientFill = new OctopusEffectGradientFill({ sourceLayer: {}, resources: {} } as any)
      const fn = { N: 10, C1: [100, 100, 100], C0: [200, 200, 200] }
      const encode: Coord = [10, 10]
      const colorSpace = 'DeviceRGB'

      expect(octopusEffectGradientFill['_parseType2Function'](fn, encode, colorSpace)).toEqual([
        { color: [200, 200, 200], interpolation: 'POWER', interpolationParameter: 10 },
        { color: [100, 100, 100] },
      ])
    })
  })

  describe('_parseType3Function', () => {
    it('parses Type3Function', () => {
      const octopusEffectGradientFill = new OctopusEffectGradientFill({
        sourceLayer: {},
        resources: {
          getShadingFunctionBounds: () => [1, 1, 1, 1],
          getShadingFunctionFunctions: () => [
            { N: 10, C1: [100, 100, 100], C0: [200, 200, 200] },
            { N: 100, C1: [10, 10, 100], C0: [20, 20, 200] },
          ],
        },
      } as any)
      octopusEffectGradientFill['_readEncode'] = vi.fn().mockReturnValue([
        [1, 1],
        [2, 2],
      ])

      expect(octopusEffectGradientFill['_parseType3Function']('DeviceRGB')).toEqual([
        {
          color: [100, 100, 100],
          interpolation: 'REVERSE_POWER',
          interpolationParameter: 10,
          position: 0,
        },
        {
          color: [20, 20, 200],
          interpolation: 'POWER',
          interpolationParameter: 100,
          position: 1,
        },
      ])
    })
  })
  describe('_parseGradient', () => {
    it('returns from _parseLinearGradient when shadingType is 2', () => {
      const octopusEffectGradientFill = new OctopusEffectGradientFill({
        sourceLayer: {},
        resources: {
          getShadingType: () => 2,
        },
      } as any)

      const _parseLinearGradientMockReturnValue = {}
      octopusEffectGradientFill['_parseLinearGradient'] = vi
        .fn()
        .mockReturnValueOnce(_parseLinearGradientMockReturnValue)

      expect(octopusEffectGradientFill['_parseGradient']()).toBe(_parseLinearGradientMockReturnValue)
    })

    it('returns from _parseRadialGradient when shadingType is 3', () => {
      const octopusEffectGradientFill = new OctopusEffectGradientFill({
        sourceLayer: {},
        resources: {
          getShadingType: () => 3,
        },
      } as any)

      const _parseRadialGradientMockValue = {}
      octopusEffectGradientFill['_parseRadialGradient'] = vi.fn().mockReturnValueOnce(_parseRadialGradientMockValue)

      expect(octopusEffectGradientFill['_parseGradient']()).toBe(_parseRadialGradientMockValue)
    })
  })
})
