import OctopusLayerGroup from '../entities/octopus/octopus-layer-group'
import OctopusLayerShape from '../entities/octopus/octopus-layer-shape'
import OctopusLayerText from '../entities/octopus/octopus-layer-text'

import type { OctopusLayerParent } from '../typings/octopus-entities'
import type SourceLayerGroup from '../entities/source/source-layer-group'
import type SourceLayerShape from '../entities/source/source-layer-shape'
import type { SourceLayer } from './create-source-layer'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type { LayerSequence } from '../services/conversion/source-layer-grouping-service'

export type OctopusLayer = OctopusLayerGroup | OctopusLayerShape | OctopusLayerText
//export type OctopusLayer = OctopusLayerGroup | OctopusLayerShape | OctopusLayerText | OctopusLayerMaskGroup

type CreateOctopusLayerOptions = {
  layerSequence: LayerSequence
  parent: OctopusLayerParent
}

function createOctopusLayerGroup({ layerSequence, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
  return new OctopusLayerGroup({
    parent,
    sourceLayers: layerSequence.sourceLayers as SourceLayerGroup[],
  })
}

// function createOctopusLayerGroupLike(options: CreateOctopusLayerOptions) {
//   const layer = options.layer as SourceLayerShape

//   return OctopusLayerMaskGroup.isShapeMaskGroup(layer)
//     ? createOctopusLayerMaskGroup(options)
//     : createOctopusLayerShape(options)
// }

// function createOctopusLayerMaskGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerMaskGroup {
//   return new OctopusLayerMaskGroup({
//     parent,
//     sourceLayer: layer as SourceLayerShape,
//   })
// }

function createOctopusLayerShape({ layerSequence, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
  return new OctopusLayerShape({
    parent,
    sourceLayers: layerSequence.sourceLayers as SourceLayerShape[],
  })
}

function createOctopusLayerText({ layerSequence, parent }: CreateOctopusLayerOptions): OctopusLayerText {
  return new OctopusLayerText({
    parent,
    layerSequence,
  })
}

type Builder = (options: CreateOctopusLayerOptions) => OctopusLayer

export function createOctopusLayer(options: CreateOctopusLayerOptions): Nullable<OctopusLayer> {
  const [layer] = options.layerSequence.sourceLayers

  if (!layer) {
    return null
  }

  const type = (Object(layer) as SourceLayer).type || ''

  const builders: {
    [key: string]: Builder
  } = {
    MarkedContext: createOctopusLayerGroup,
    Path: createOctopusLayerShape,
    TextGroup: createOctopusLayerText,
    Shading: createOctopusLayerShape,
  }
  const builder = builders[type]
  return typeof builder === 'function' ? builder(options) : null
}
