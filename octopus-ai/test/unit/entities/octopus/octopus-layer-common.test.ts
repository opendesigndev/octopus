/* eslint-disable @typescript-eslint/no-explicit-any */

import { OctopusLayerCommon } from '../../../../src/entities/octopus/octopus-layer-common'
import { BLEND_MODES } from '../../../../src/utils/blend-modes'

import type { OctopusLayerCommonOptions } from '../../../../src/entities/octopus/octopus-layer-common'

jest.mock('../../../../src/entities/octopus/octopus-layer-mask-group')
jest.mock('../../../../src/entities/octopus/octopus-layer-soft-mask-group')
jest.mock('../../../../src/entities/octopus/octopus-layer-group')
jest.mock('../../../../src/entities/octopus/octopus-layer-shape-shape-adapter')
jest.mock('../../../../src/entities/octopus/octopus-layer-shape')
jest.mock('../../../../src/entities/octopus/octopus-layer-shading')
jest.mock('../../../../src/entities/octopus/octopus-layer-shape-x-object-image-adapter')
jest.mock('../../../../src/entities/octopus/octopus-layer-text')
jest.mock('../../../../src/entities/octopus/octopus-layer-text')

class MockClass extends OctopusLayerCommon {
  constructor(options: OctopusLayerCommonOptions) {
    super(options)
  }
}

function getMockInstance(sourceLayerProps?: Record<string, any>) {
  const options: any = {
    layerSequence: { sourceLayers: [{ parentArtboard: { sourceDesign: { uniqueId: () => 1 } }, ...sourceLayerProps }] },
    parent: {},
  }

  return new MockClass(options)
}
describe('entities/octopus/octopus-layer-common', () => {
  describe('get blendMode', () => {
    it('returns blend BLEND_MODES.Normal when there is no blendMode on SourceLayer', () => {
      const instance = getMockInstance()
      expect(instance.blendMode).toEqual(BLEND_MODES.Normal)
    })

    it('returns value from BLEND_MODES if blendMode key is present ', () => {
      const instance = getMockInstance({ blendMode: 'Darken' })
      expect(instance.blendMode).toEqual(BLEND_MODES.Darken)
    })

    it('transforms pascal case to uppercase SNAKE_CASE blendMode key if it is not existent in BLEND_MODES', () => {
      const instance = getMockInstance({ blendMode: 'SomeBlend' })
      expect(instance.blendMode).toEqual('SOME_BLEND')
    })
  })
})
