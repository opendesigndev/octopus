import { asArray } from '@avocode/octopus-common/dist/utils/as'

import { createOctopusLayer } from '../factories/create-octopus-layer'
import { createSourceLayer } from '../factories/create-source-layer'
import { layerGroupingService } from '../services/instances/layer-grouping-service'

import type { SourceLayerParent } from '../entities/source/source-layer-common'
import type { OctopusLayer, CreateOctopusLayerOptions } from '../factories/create-octopus-layer'
import type { SourceLayer } from '../factories/create-source-layer'
import type { LayerSequence } from '../services/conversion/text-layer-grouping-service'
import type { OctopusLayerParent } from '../typings/octopus-entities'
import type { RawLayer } from '../typings/raw'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

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
  builder: (options: CreateOctopusLayerOptions) => Nullish<OctopusLayer>
}

export function createOctopusLayersFromSequences({
  layerSequences,
  parent,
  builder,
}: CreateOctopusLayersFromSequencesOptions): OctopusLayer[] {
  return layerSequences.reduce<OctopusLayer[]>((children, layerSequence) => {
    const childLayer = builder({
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
  const layerSequences = layerGroupingService?.getLayerSequences(children)

  if (!layerSequences) {
    return []
  }

  return createOctopusLayersFromSequences({ layerSequences, parent, builder: createOctopusLayer })
}
