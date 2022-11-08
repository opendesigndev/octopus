/* eslint-disable @typescript-eslint/no-explicit-any */
import { mocked } from 'jest-mock'

import { buildOctopusLayer, createOctopusLayer } from '../../factories/create-octopus-layer'
import { createSourceLayer } from '../../factories/create-source-layer'
import { LayerGroupingService } from '../../services/conversion/layer-grouping-service'
import {
  createOctopusLayersFromLayerSequences,
  initOctopusLayerChildren,
  initSourceLayerChildren,
  uniqueIdFactory,
} from '../layer'

jest.mock('../../services/instances/text-layer-grouping-service', () => ({
  __esModule: true,
  textLayerGroupingService: jest.fn(),
}))

jest.mock('../../factories/create-source-layer')
jest.mock('../../services/conversion/layer-grouping-service')
jest.mock('../../factories/create-octopus-layer')

describe('utils/layer', () => {
  describe('initSourceLayerChildren', () => {
    it('creates array of truthy sourceLayers', () => {
      const parent = { id: 1, type: 'GROUP' }

      const layers = [{ id: 1 }, { id: 2 }, { id: 3 }]

      const returnValue1 = { id: 1 }
      const returnValue2 = { id: 2 }
      mocked(createSourceLayer).mockReturnValueOnce(returnValue1 as any)
      mocked(createSourceLayer).mockReturnValueOnce(returnValue2 as any)
      mocked(createSourceLayer).mockReturnValueOnce(null)

      expect(initSourceLayerChildren({ layers, parent } as any)).toEqual([returnValue1, returnValue2])

      expect(createSourceLayer).toHaveBeenCalledWith({ layer: layers[0], parent })
      expect(createSourceLayer).toHaveBeenCalledWith({ layer: layers[1], parent })
      expect(createSourceLayer).toHaveBeenCalledWith({ layer: layers[2], parent })
    })
  })

  describe('createOctopusLayersFromLayerSequences', () => {
    it('returns array of truthy values returned from buildOctopusLayer', () => {
      const parent = { id: 1, type: 'GROUP' }

      const layerSequences = [
        { sourceLayers: [{ id: 1 }] },
        { sourceLayers: [{ id: 2 }] },
        { sourceLayers: [{ id: 3 }] },
      ]

      const returnValue1 = { id: 1 }
      const returnValue2 = { id: 2 }
      mocked(buildOctopusLayer).mockReturnValueOnce(returnValue1 as any)
      mocked(buildOctopusLayer).mockReturnValueOnce(returnValue2 as any)
      mocked(buildOctopusLayer).mockReturnValueOnce(null)

      expect(createOctopusLayersFromLayerSequences({ layerSequences, parent } as any)).toEqual([
        returnValue1,
        returnValue2,
      ])

      expect(buildOctopusLayer).toHaveBeenCalledWith({ layerSequence: layerSequences[0], parent })
      expect(buildOctopusLayer).toHaveBeenCalledWith({ layerSequence: layerSequences[1], parent })
      expect(buildOctopusLayer).toHaveBeenCalledWith({ layerSequence: layerSequences[2], parent })
    })
  })

  describe('initOctopusLayerChildren', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('creates array of truthy values returned from createOctopusLayer', () => {
      const layer = { id: 1, type: 'SHAPE' }
      const parent = { id: 3, type: 'GROUP' }
      const expectedValue = [layer]

      mocked(createOctopusLayer).mockReturnValueOnce(layer as any)
      mocked(createOctopusLayer).mockReturnValueOnce(null)
      const getLayerSequences = mocked(jest.fn()).mockReturnValueOnce([[layer], [layer]])
      mocked(LayerGroupingService).mockReturnValueOnce({ getLayerSequences } as any)

      expect(initOctopusLayerChildren({ layers: [layer, layer], parent } as any)).toEqual(expectedValue)
      expect(createOctopusLayer).toHaveBeenCalledTimes(2)
    })

    it('returns empty array when getLayerSequences returns falsy', () => {
      const layer = { id: 1, type: 'SHAPE' }
      const parent = { id: 3, type: 'GROUP' }

      mocked(createOctopusLayer).mockReturnValueOnce(layer as any)
      mocked(createOctopusLayer).mockReturnValueOnce(layer as any)
      const getLayerSequences = mocked(jest.fn()).mockReturnValueOnce(null)
      mocked(LayerGroupingService).mockReturnValueOnce({ getLayerSequences } as any)

      expect(initOctopusLayerChildren({ layers: [layer, layer], parent } as any)).toEqual([])
      expect(createOctopusLayer).not.toHaveBeenCalled()
    })
  })

  describe('uniqueIdFactory', () => {
    it('increases id value by 1 for each call', () => {
      const uniqId = uniqueIdFactory(10)
      const expectedResults = ['11', '12', '13', '14', '15']

      expectedResults.forEach((expectedVal) => {
        expect(uniqId()).toBe(expectedVal)
      })
    })
  })
})
