/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it, vi } from 'vitest'

import { OctopusLayerShading } from '../octopus-layer-shading.js'
import { OctopusLayerShapeShapeAdapter } from '../octopus-layer-shape-shape-adapter.js'

vi.mock('../octopus-layer-shape-shape-adapter')
vi.mock('../octopus-layer-common', () => {
  return {
    __esModule: true,
    OctopusLayerCommon: vi.fn(),
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

      vi.mocked(OctopusLayerShapeShapeAdapter.prototype.getPath).mockReturnValueOnce({ type: 'PATH' } as any)
      vi.mocked(OctopusLayerShapeShapeAdapter.prototype.getPath).mockReturnValueOnce({ type: 'RECT' } as any)
      vi.mocked(OctopusLayerShapeShapeAdapter.prototype.getPath).mockReturnValueOnce({ type: 'COMPOUND' } as any)

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
