/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it, vi } from 'vitest'

import { MaskGroupingService } from '../../mask-grouping-service/index.js'
import { LayerGroupingService } from '../index.js'

vi.mock('../../text-layer-grouping-service')
vi.mock('../../mask-grouping-service')

describe('LayerGroupingService', () => {
  it('returns from passed in services', () => {
    const textLayerGroupingServiceGetLayerSequencesReturnVal: any = {}
    const textLayerGroupingServiceGetLayerSequences = vi
      .fn()
      .mockReturnValueOnce(textLayerGroupingServiceGetLayerSequencesReturnVal)

    const textLayerGroupingServiceInstance: any = {
      getLayerSequences: textLayerGroupingServiceGetLayerSequences,
    }
    const maskGroupingServiceGetLayerSequencesReturnVal: any = {}
    const maskGroupingServiceGetLayerSequences = vi
      .fn()
      .mockReturnValueOnce(maskGroupingServiceGetLayerSequencesReturnVal)

    const maskGroupingServiceInstance: any = {
      groupLayerSequences: maskGroupingServiceGetLayerSequences,
    }
    vi.mocked(MaskGroupingService).mockReturnValueOnce(maskGroupingServiceInstance)

    const layerGroupingService = new LayerGroupingService(textLayerGroupingServiceInstance)

    const params: any = {}

    expect(layerGroupingService.getLayerSequences(params)).toEqual(maskGroupingServiceGetLayerSequencesReturnVal)
    expect(textLayerGroupingServiceGetLayerSequences).toHaveBeenCalledWith(params)
    expect(maskGroupingServiceInstance.groupLayerSequences).toHaveBeenCalledWith(
      textLayerGroupingServiceGetLayerSequencesReturnVal
    )
  })
})
