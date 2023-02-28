import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import { buildOctopusLayer, createOctopusLayer } from '../factories/create-octopus-layer.js'
import { createSourceLayer } from '../factories/create-source-layer.js'
import { LayerGroupingService } from '../services/conversion/layer-grouping-service/index.js'
import { textLayerGroupingService } from '../services/instances/text-layer-grouping-service.js'

import type { SourceLayerParent } from '../entities/source/source-layer-common.js'
import type { OctopusLayer } from '../factories/create-octopus-layer.js'
import type { SourceLayer } from '../factories/create-source-layer.js'
import type { LayerSequence } from '../services/conversion/text-layer-grouping-service/index.js'
import type { OctopusLayerParent } from '../typings/octopus-entities.js'
import type { RawLayer } from '../typings/raw/index.js'
import type { Nullish } from '@opendesign/octopus-common/dist/utility-types.js'

type InitSourceLayerChildrenOptions = {
  layers: Nullish<RawLayer[]>
  parent: SourceLayerParent
}

export function initSourceLayerChildren({ layers, parent }: InitSourceLayerChildrenOptions): SourceLayer[] {
  const children = asArray(layers)

  return children.reduce<SourceLayer[]>((children, layer) => {
    const childLayer = createSourceLayer({
      layer,
      parent,
    })
    return childLayer ? [...children, childLayer] : children
  }, [])
}

type CreateOctopusLayersFromSequencesOptions = {
  parent: OctopusLayerParent
  layerSequences: LayerSequence[]
}

export function createOctopusLayersFromLayerSequences({
  layerSequences,
  parent,
}: CreateOctopusLayersFromSequencesOptions): OctopusLayer[] {
  return layerSequences.reduce<OctopusLayer[]>((children, layerSequence) => {
    const childLayer = buildOctopusLayer({
      layerSequence,
      parent,
    })

    return childLayer ? [...children, childLayer] : children
  }, [])
}

type InitOctopusLayerSequenceOptions = {
  layers: Nullish<SourceLayer[]>
  parent: OctopusLayerParent
}

export function initOctopusLayerChildren({ layers, parent }: InitOctopusLayerSequenceOptions): OctopusLayer[] {
  const children = asArray(layers)

  if (!textLayerGroupingService) {
    return []
  }

  const layerGroupingService = new LayerGroupingService(textLayerGroupingService)
  const layerSequenceGroups = layerGroupingService.getLayerSequences(children)

  if (!layerSequenceGroups) {
    return []
  }

  return layerSequenceGroups.reduce<OctopusLayer[]>((children, layerSequences) => {
    const childLayer = createOctopusLayer({
      layerSequences,
      parent,
    })

    return childLayer ? [...children, childLayer] : children
  }, [])
}
