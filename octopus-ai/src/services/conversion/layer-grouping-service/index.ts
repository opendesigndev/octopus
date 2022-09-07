import isEqual from 'lodash/isEqual'

import type { SourceLayerShape } from '../../../entities/source/source-layer-shape'
import type { SourceLayer } from '../../../factories/create-source-layer'
import type { LayerSequence, TextLayerGroupingservice } from '../text-layer-grouping-service'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

type SourceLayerMasked = SourceLayer & {
  mask: SourceLayerShape
}

export class LayerGroupingService {
  private _textLayerGroupingService: TextLayerGroupingservice
  private _groupedSequences: LayerSequence[][] = []
  private _currentMask: Nullish<SourceLayerShape> = null
  private _currentSequenceGroup: LayerSequence[] = []

  constructor(textLayerGroupingService: TextLayerGroupingservice) {
    this._textLayerGroupingService = textLayerGroupingService
  }

  private _resetCurrentSequenceGroup() {
    if (this._currentSequenceGroup.length) {
      this._groupedSequences.push(this._currentSequenceGroup)
    }

    this._currentSequenceGroup = []
  }

  private _pushLayerSequence = (layerSequence: LayerSequence) => {
    const [sourceLayer] = layerSequence.sourceLayers

    if (!('mask' in sourceLayer) || !sourceLayer.mask) {
      this._currentMask = null
      this._resetCurrentSequenceGroup()
      this._groupedSequences.push([{ ...layerSequence }])

      return
    }

    const maskedSourceLayer = sourceLayer as SourceLayerMasked

    if (isEqual(this._currentMask, maskedSourceLayer.mask)) {
      this._currentSequenceGroup.push({ ...layerSequence })
      return
    }

    this._resetCurrentSequenceGroup()

    this._currentSequenceGroup = [{ ...layerSequence }]
    this._currentMask = maskedSourceLayer.mask
  }

  private _groupLayerSequences(layerSequences: LayerSequence[]): LayerSequence[][] {
    layerSequences.forEach(this._pushLayerSequence)

    this._resetCurrentSequenceGroup()

    return this._groupedSequences
  }

  getLayerSequences(layers: SourceLayer[]): LayerSequence[][] {
    const textGroupings = this._textLayerGroupingService.getLayerSequences(layers)

    return this._groupLayerSequences(textGroupings)
  }
}
