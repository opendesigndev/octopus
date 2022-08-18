import { asArray } from '@avocode/octopus-common/dist/utils/as'

import { createOctopusLayer } from '../factories/create-octopus-layer'
import { createSourceLayer } from '../factories/create-source-layer'
import { textLayerGroupingService } from '../services/instances/text-layer-grouping-service'

import type { SourceLayerParent } from '../entities/source/source-layer-common'
import type { OctopusLayer } from '../factories/create-octopus-layer'
import type { SourceLayer } from '../factories/create-source-layer'
import type { OctopusLayerParent } from '../typings/octopus-entities'
import type { RawLayer } from '../typings/raw'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

type InitSourceLayerChildrenOptions = {
  layers: Nullable<RawLayer[]>
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

type InitOctopusLayerSequenceOptions = {
  layers: Nullable<SourceLayer[]>
  parent: OctopusLayerParent
}

export function initOctopusLayerChildren({ layers, parent }: InitOctopusLayerSequenceOptions): OctopusLayer[] {
  const children = asArray(layers)
  const layerSequences = textLayerGroupingService?.getLayerSequences(children)

  if (!layerSequences) {
    return []
  }

  return layerSequences.reduce<OctopusLayer[]>((children, layerSequence) => {
    const childLayer = createOctopusLayer({
      layerSequence,
      parent,
    })

    return childLayer ? [...children, childLayer] : children
  }, [])
}
