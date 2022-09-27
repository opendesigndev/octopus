/* eslint-disable @typescript-eslint/no-explicit-any */

import { mocked } from 'jest-mock'

import { OctopusLayerSoftMaskGroup } from '../../../../src/entities/octopus/octopus-layer-soft-mask-group'
import { createOctopusLayerGroup } from '../../../../src/factories/create-octopus-layer'

jest.mock('../../../../src/factories/create-octopus-layer')

function getTestingSoftMaskGroup(sourceLayerProps?: Record<string, any>) {
  const options: any = {
    parent: {},
    layerSequence: {
      sourceLayers: [{ parentArtboard: { sourceDesign: { uniqueId: () => 1 } }, ...sourceLayerProps }],
    },
  }

  return new OctopusLayerSoftMaskGroup(options)
}
describe('entities/octopus/octopus-layer-soft-mask-group', () => {
  describe('._getMaskChannels', () => {
    it('returns DEFAULT_MASK_CHANNELS when maskType is not Luminosity', () => {
      const octopusLayerSoftMaskGroup = getTestingSoftMaskGroup({ sMask: { TR: 'TR', S: 'notLuminosity' } })
      expect(octopusLayerSoftMaskGroup['_getMaskChannels']()).toEqual(OctopusLayerSoftMaskGroup.DEFAULT_MASK_CHANNELS)
    })

    it('returns INVERSE_LUMINOSITY_MASK_CHANNELS when maskType is Luminosity and TR is defined', () => {
      const octopusLayerSoftMaskGroup = getTestingSoftMaskGroup({ sMask: { TR: 'TR', S: 'Luminosity' } })
      expect(octopusLayerSoftMaskGroup['_getMaskChannels']()).toEqual(
        OctopusLayerSoftMaskGroup.INVERSE_LUMINOSITY_MASK_CHANNELS
      )
    })

    it('returns LUMINOSITY_MASK_CHANNELS when maskType is Luminosity and TR is not defined', () => {
      const octopusLayerSoftMaskGroup = getTestingSoftMaskGroup({ sMask: { TR: undefined, S: 'Luminosity' } })
      expect(octopusLayerSoftMaskGroup['_getMaskChannels']()).toEqual(
        OctopusLayerSoftMaskGroup.LUMINOSITY_MASK_CHANNELS
      )
    })
  })

  describe('._createMask', () => {
    it('returns null when createOctopusLayerGroup returns falsy', () => {
      const octopusLayerSoftMaskGroup = getTestingSoftMaskGroup()
      expect(octopusLayerSoftMaskGroup['_createMask']()).toEqual(null)
    })

    it('returns null when mask.convert() returns falsy', () => {
      mocked(createOctopusLayerGroup).mockReturnValue({ convert: () => null } as any)
      const octopusLayerSoftMaskGroup = getTestingSoftMaskGroup()
      expect(octopusLayerSoftMaskGroup['_createMask']()).toEqual(null)
    })

    it('returns converted mask and sets it to not visible ', () => {
      mocked(createOctopusLayerGroup).mockReturnValue({ convert: () => ({}) } as any)
      const octopusLayerSoftMaskGroup = getTestingSoftMaskGroup()
      expect(octopusLayerSoftMaskGroup['_createMask']()).toEqual({ visible: false })
    })
  })
})
