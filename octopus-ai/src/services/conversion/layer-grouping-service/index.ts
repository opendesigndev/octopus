import { MaskGroupingService } from '../mask-grouping-service'

import type { SourceLayer } from '../../../factories/create-source-layer'
import type { LayerSequence, TextLayerGroupingservice } from '../text-layer-grouping-service'

export class LayerGroupingService {
  private _textLayerGroupingService: TextLayerGroupingservice
  private _maskGroupingService: MaskGroupingService

  constructor(textLayerGroupingService: TextLayerGroupingservice) {
    this._textLayerGroupingService = textLayerGroupingService
    this._maskGroupingService = new MaskGroupingService()
  }

  getLayerSequences(layers: SourceLayer[]): LayerSequence[][] {
    const textGroupings = this._textLayerGroupingService.getLayerSequences(layers)

    return this._maskGroupingService.groupLayerSequences(textGroupings)
  }
}
