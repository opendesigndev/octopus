/* eslint-disable @typescript-eslint/no-explicit-any */

import { mocked } from 'jest-mock'

import { LayerGroupingService } from '../../../../../src/services/conversion/layer-grouping-service'
import { MaskGroupingService } from '../../../../../src/services/conversion/mask-grouping-service'

jest.mock('../../../../../src/services/conversion/text-layer-grouping-service')
jest.mock('../../../../../src/services/conversion/mask-grouping-service')

describe('services/layer-grouping-service', () => {
  it('returns from passed in services', () => {
    const textLayerGroupingServiceGetLayerSequencesReturnVal: any = {}
    const textLayerGroupingServiceGetLayerSequences = jest
      .fn()
      .mockReturnValueOnce(textLayerGroupingServiceGetLayerSequencesReturnVal)
    const textLayerGroupingServiceInstance: any = {
      getLayerSequences: textLayerGroupingServiceGetLayerSequences,
    }
    const maskGroupingServiceGetLayerSequencesReturnVal: any = {}
    const maskGroupingServiceGetLayerSequences = jest
      .fn()
      .mockReturnValueOnce(maskGroupingServiceGetLayerSequencesReturnVal)

    const maskGroupingServiceInstance: any = {
      getLayerSequences: maskGroupingServiceGetLayerSequences,
    }
    const mockedMaskGroupingService = mocked(MaskGroupingService).mockReturnValueOnce(maskGroupingServiceInstance)

    const layerGroupingService = new LayerGroupingService(textLayerGroupingServiceInstance)

    const params: any = {}

    expect(layerGroupingService.getLayerSequences(params)).toEqual(maskGroupingServiceGetLayerSequencesReturnVal)
    expect(textLayerGroupingServiceGetLayerSequences).toHaveBeenCalledWith(params)
    expect(mockedMaskGroupingService).toHaveBeenCalledWith(textLayerGroupingServiceGetLayerSequencesReturnVal)
  })
})
