/* eslint-disable @typescript-eslint/no-explicit-any */

import { OctopusEffectStroke } from '../octopus-effect-stroke.js'

describe('OctopusEffectStroke', () => {
  describe('parseDashing', () => {
    it('replaces 0 values with minimum OctopusEffectStroke.MIN_DASH_INPUT and secures even array length', () => {
      const octopusEffectStroke = new OctopusEffectStroke({
        resources: {},
        sourceLayer: { dashing: [0, 0, 10] },
      } as any)

      expect(octopusEffectStroke['_parseDashing']()).toEqual([
        OctopusEffectStroke.MIN_DASH_INPUT,
        OctopusEffectStroke.MIN_DASH_INPUT,
        10,
        OctopusEffectStroke.MIN_DASH_INPUT,
      ])
    })
  })
})
