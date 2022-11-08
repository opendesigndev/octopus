/* eslint-disable @typescript-eslint/no-explicit-any */

import { MaskGroupingService } from '..'

describe('MaskGroupingService', () => {
  it('creates layerSequenceGroups according to mask existence and their sequantiality', () => {
    const layerSequences: any = [
      { sourceLayers: [{ id: 1 }] },
      { sourceLayers: [{ id: 2, mask: { id: 'mask-2' } }] },
      { sourceLayers: [{ id: 3, mask: { id: 'mask-2' } }] },
      { sourceLayers: [{ id: 4 }] },
      { sourceLayers: [{ id: 5, mask: { id: 'mask-2' } }] },
      { sourceLayers: [{ id: 6, mask: { id: 'mask-6' } }] },
    ]

    const expectedValue = [
      [{ sourceLayers: [{ id: 1 }] }],
      [{ sourceLayers: [{ id: 2, mask: { id: 'mask-2' } }] }, { sourceLayers: [{ id: 3, mask: { id: 'mask-2' } }] }],
      [{ sourceLayers: [{ id: 4 }] }],
      [{ sourceLayers: [{ id: 5, mask: { id: 'mask-2' } }] }],
      [{ sourceLayers: [{ id: 6, mask: { id: 'mask-6' } }] }],
    ]
    const maskGroupingService = new MaskGroupingService()
    expect(maskGroupingService.groupLayerSequences(layerSequences)).toEqual(expectedValue)
  })
})
