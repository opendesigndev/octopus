import OctopusLayerGroup from '../entities-octopus/octopus-layer-group'
// import OctopusLayerMaskGroup from '../entities-octopus/octopus-layer-maskgroup'
import OctopusLayerShape from '../entities-octopus/octopus-layer-shape'
import OctopusLayerText from '../entities-octopus/octopus-layer-text'

import type { OctopusLayerParent } from '../typings/octopus-entities'
import type SourceLayerGroup from '../entities-source/source-layer-group'
import type SourceLayerShape from '../entities-source/source-layer-shape'
import type SourceLayerText from '../entities-source/source-layer-text'
import type { SourceLayer } from './create-source-layer'
import { Nullable } from '../typings/helpers'

export type OctopusLayer = OctopusLayerGroup | OctopusLayerShape | OctopusLayerText

type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

function createOctopusLayerGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
  return new OctopusLayerGroup({
    parent,
    sourceLayer: layer as SourceLayerGroup,
  })
}

// function createOctopusLayerMaskGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerMaskGroup {
//   return new OctopusLayerMaskGroup({
//     parent,
//     sourceLayer: layer as SourceLayerGroup
//   })
// }

// function createOctopusLayerGroupLike(options: CreateOctopusLayerOptions) {
//   return OctopusLayerMaskGroup.isMaskGroupLike(options.layer)
//     ? createOctopusLayerMaskGroup(options)
//     : createOctopusLayerGroup(options)
// }

function createOctopusLayerShape({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
  return new OctopusLayerShape({
    parent,
    sourceLayer: layer as SourceLayerShape,
  })
}

function createOctopusLayerText({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerText {
  return new OctopusLayerText({
    parent,
    sourceLayer: layer as SourceLayerText,
  })
}

type Builder = (options: CreateOctopusLayerOptions) => OctopusLayerText | OctopusLayerShape | OctopusLayerGroup

export function createOctopusLayer(options: CreateOctopusLayerOptions): Nullable<OctopusLayer> {
  const type = (Object(options.layer) as SourceLayer).type || ''

  const builders: {
    [key: string]: Builder
  } = {
    MarkedContext: createOctopusLayerGroup,
    Path: createOctopusLayerShape,
    TextGroup: createOctopusLayerText,
  }
  const builder = builders[type]
  return typeof builder === 'function' ? builder(options) : null
}