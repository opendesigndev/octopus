/* eslint-disable @typescript-eslint/no-explicit-any */

import { mocked } from 'jest-mock'

import { LayerGroupingService } from '../index.js'
import { MaskGroupingService } from '../../mask-grouping-service/index.js'

jest.mock('../../text-layer-grouping-service')
jest.mock('../../mask-grouping-service')

describe('LayerGroupingService', () => {
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
      groupLayerSequences: maskGroupingServiceGetLayerSequences,
    }
    mocked(MaskGroupingService).mockReturnValueOnce(maskGroupingServiceInstance)

    const layerGroupingService = new LayerGroupingService(textLayerGroupingServiceInstance)

    const params: any = {}

    expect(layerGroupingService.getLayerSequences(params)).toEqual(maskGroupingServiceGetLayerSequencesReturnVal)
    expect(textLayerGroupingServiceGetLayerSequences).toHaveBeenCalledWith(params)
    expect(maskGroupingServiceInstance.groupLayerSequences).toHaveBeenCalledWith(
      textLayerGroupingServiceGetLayerSequencesReturnVal
    )
  })
})
