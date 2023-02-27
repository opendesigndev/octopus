/* eslint-disable @typescript-eslint/no-explicit-any */

import { mocked } from 'jest-mock'

import { OctopusLayerShading } from '../octopus-layer-shading.js'
import { OctopusLayerShapeShapeAdapter } from '../octopus-layer-shape-shape-adapter.js'

jest.mock('../octopus-layer-shape-shape-adapter')
jest.mock('../octopus-layer-common', () => {
  return {
    __esModule: true,
    OctopusLayerCommon: jest.fn(),
  }
})

function getTestingOctopusLayerShadingInstance(sourceLayerProps?: Record<string, any>) {
  const options: any = {
    parent: {},
    layerSequence: {
      sourceLayers: [{ parentArtboard: { sourceDesign: { uniqueId: () => 1 } } }],
    },
  }

  const instance = new OctopusLayerShading(options)
  return Object.create(instance, { _sourceLayer: { value: sourceLayerProps ?? {} } })
}

describe('OctopusLayerShading', () => {
  describe('createClippingPaths', () => {
    it('creates clippingPaths', () => {
      const instance = getTestingOctopusLayerShadingInstance({
        clippingPaths: [
          { transformMatrix: [1, 0, 0, 1, 0, 0] },
          { transformMatrix: [2, 0, 0, 1, 0, 0] },
          { transformMatrix: [3, 0, 0, 1, 0, 0] },
        ],
      })
      mocked(OctopusLayerShapeShapeAdapter).mockReturnValueOnce({ getPath: () => ({ type: 'PATH' }) } as any)
      mocked(OctopusLayerShapeShapeAdapter).mockReturnValueOnce({ getPath: () => ({ type: 'RECT' }) } as any)
      mocked(OctopusLayerShapeShapeAdapter).mockReturnValueOnce({ getPath: () => ({ type: 'COMPOUND' }) } as any)

      expect(instance['_createClippingPaths']()).toEqual([
        {
          transform: [1, 0, 0, 1, 0, 0],
          type: 'PATH',
        },
        {
          transform: [2, 0, 0, 1, 0, 0],
          type: 'RECT',
        },
        {
          transform: [3, 0, 0, 1, 0, 0],
          type: 'COMPOUND',
        },
      ])
    })
  })
})
