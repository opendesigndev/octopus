import isEqual from 'lodash/isEqual'

import type { SourceLayerShape } from '../../../entities/source/source-layer-shape'
import type { SourceLayer } from '../../../factories/create-source-layer'
import type { LayerSequence } from '../text-layer-grouping-service'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

type SourceLayerMasked = SourceLayer & {
  mask: SourceLayerShape
}

export class MaskGroupingService {
  groupLayerSequences(layerSequences: LayerSequence[]): LayerSequence[][] {
    let currentMask: Nullish<SourceLayerShape> = null

    return [...layerSequences].reduce<LayerSequence[][]>((layerSequenceGroups, layerSequence) => {
      const [sourceLayer] = layerSequence.sourceLayers

      if (!('mask' in sourceLayer) || !sourceLayer.mask) {
        currentMask = null
        layerSequenceGroups.push([{ ...layerSequence }])

        return layerSequenceGroups
      }

      const maskedSourceLayer = sourceLayer as SourceLayerMasked

      if (!isEqual(maskedSourceLayer.mask, currentMask)) {
        currentMask = maskedSourceLayer.mask
        layerSequenceGroups.push([{ ...layerSequence }])
        return layerSequenceGroups
      }

      const lastLayerSequenceGroup = layerSequenceGroups[layerSequenceGroups.length - 1]
      lastLayerSequenceGroup.push({ ...layerSequence })

      return layerSequenceGroups
    }, [])
  }
}
