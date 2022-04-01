import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

import OctopusLayerGroup from '../entities/octopus/octopus-layer-group'
import OctopusLayerShape from '../entities/octopus/octopus-layer-shape'
import OctopusLayerShapeShapeAdapter from '../entities/octopus/octopus-layer-shape-shape-adapter'
import OctopusLayerShapeXObjectImageAdapter from '../entities/octopus/octopus-layer-shape-xObject-adapter'
import OctopusLayerText from '../entities/octopus/octopus-layer-text'
import type SourceLayerGroup from '../entities/source/source-layer-group'
import type SourceLayerShape from '../entities/source/source-layer-shape'
import type SourceLayerXObjectImage from '../entities/source/source-layer-x-object-image'
import type { LayerSequence } from '../services/conversion/source-layer-grouping-service'
import type { OctopusLayerParent } from '../typings/octopus-entities'
import type { SourceLayer } from './create-source-layer'

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

function createOctopusLayerShapeFromShapeAdapter({
  layerSequence,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape {
  const sourceLayers = layerSequence.sourceLayers as SourceLayerShape[]
  const adapter = new OctopusLayerShapeShapeAdapter({ parent, sourceLayers })
  return new OctopusLayerShape({ parent, sourceLayers, adapter })
}

function createOctopusLayerShapeFromXObjectImageAdapter({
  layerSequence,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape {
  const sourceLayers = layerSequence.sourceLayers as SourceLayerXObjectImage[]
  const adapter = new OctopusLayerShapeXObjectImageAdapter({ parent, sourceLayers })
  return new OctopusLayerShape({ parent, sourceLayers, adapter })
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
    Path: createOctopusLayerShapeFromShapeAdapter,
    TextGroup: createOctopusLayerText,
    Shading: createOctopusLayerShapeFromShapeAdapter,
    XObject: createOctopusLayerShapeFromXObjectImageAdapter,
  }

  const builder = builders[type]
  return typeof builder === 'function' ? builder(options) : null
}
