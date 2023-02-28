import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group.js'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group.js'
import { OctopusLayerShading } from '../entities/octopus/octopus-layer-shading.js'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape.js'
import { OctopusLayerShapeShapeAdapter } from '../entities/octopus/octopus-layer-shape-shape-adapter.js'
import { OctopusLayerShapeXObjectImageAdapter } from '../entities/octopus/octopus-layer-shape-x-object-image-adapter.js'
import { OctopusLayerSoftMaskGroup } from '../entities/octopus/octopus-layer-soft-mask-group.js'
import { OctopusLayerText } from '../entities/octopus/octopus-layer-text.js'

import type { OctopusLayerMaskOptions } from '../entities/octopus/octopus-layer-mask-group.js'
import type { LayerSequence } from '../services/conversion/text-layer-grouping-service/index.js'
import type { OctopusLayerParent } from '../typings/octopus-entities.js'
import type { SourceLayer } from './create-source-layer.js'
import type { Nullish } from '@opendesign/octopus-common/dist/utility-types.js'

export type OctopusLayer =
  | OctopusLayerGroup
  | OctopusLayerShape
  | OctopusLayerText
  | OctopusLayerMaskGroup
  | OctopusLayerSoftMaskGroup
  | OctopusLayerShading

export type CreateOctopusLayerOptions = {
  layerSequences: LayerSequence[]
  parent: OctopusLayerParent
}

export type BuildOctopusLayerOptions = {
  layerSequence: LayerSequence
  parent: OctopusLayerParent
}

export function createOctopusLayerGroup(options: BuildOctopusLayerOptions): OctopusLayerGroup {
  return new OctopusLayerGroup(options)
}

export function createOctopusLayerMaskGroup(options: OctopusLayerMaskOptions): OctopusLayerMaskGroup {
  return new OctopusLayerMaskGroup(options)
}

export function createOctopusLayerShapeFromShapeAdapter({
  layerSequence,
  parent,
}: BuildOctopusLayerOptions): OctopusLayerShape {
  const adapter = new OctopusLayerShapeShapeAdapter({
    parent,
    layerSequence,
  })
  return new OctopusLayerShape({ adapter })
}

export function createOctopusLayerShading(options: BuildOctopusLayerOptions): OctopusLayerShading {
  return new OctopusLayerShading(options)
}

export function createOctopusLayerShapeFromXObjectImageAdapter({
  layerSequence,
  parent,
}: BuildOctopusLayerOptions): OctopusLayerShape {
  const adapter = new OctopusLayerShapeXObjectImageAdapter({
    parent,
    layerSequence,
  })
  return new OctopusLayerShape({ adapter })
}

export function createOctopusLayerSoftMaskGroup({
  layerSequence,
  parent,
}: BuildOctopusLayerOptions): OctopusLayerSoftMaskGroup {
  return new OctopusLayerSoftMaskGroup({
    layerSequence,
    parent,
  })
}

function createOctopusLayerText(options: BuildOctopusLayerOptions): OctopusLayerText {
  return new OctopusLayerText(options)
}

type Builder = (options: BuildOctopusLayerOptions) => OctopusLayer

export function buildOctopusLayer(options: BuildOctopusLayerOptions): Nullish<OctopusLayer> {
  const type = (Object(options.layerSequence.sourceLayers[0]) as SourceLayer).type || ''

  const builders: {
    [key: string]: Builder
  } = {
    MarkedContext: createOctopusLayerGroup,
    Form: createOctopusLayerGroup,
    Path: createOctopusLayerShapeFromShapeAdapter,
    TextGroup: createOctopusLayerText,
    Image: createOctopusLayerShapeFromXObjectImageAdapter,
    Shading: createOctopusLayerShading,
  }
  const builder = builders[type]
  const layer = typeof builder === 'function' ? builder(options) : null

  return layer
}

/** there are 2 types of masks in AI: clip mask and so called soft mask which masks layer with its colors.
 * In source files, each layer can have ClippingPath property in its GraphicsState. This ClippingPath serves as
 * a clip mask.
 * As one layer can mask several layers, each of these layers can have identical ClippingPath. That is why we create OctopusLayerMaskGroup(clip mask)
 * from source ClippingPath where ClippingPath serves as a mask and layer as a child. If other layer in sequence has same ClippingPath, it is
 * added to the existing OctopusLayerMaskGroup as a child. To do this operation we create data structure of layerSequence array, where this array can 
 * supplies children for OctopusLayerMaskGroup, but only when layers in sequences have mask property. LayerSequence groups text arrays and we can not
 * use this structure for masks, as we can have textLayers and other layers having a same clippingPath. 

 * Source layer can also have a soft mask. If it has a soft mask, soft mask is created and clip mask is ignored. Source Illustrator file has Resources
 * section which contains useful information about properties needed for correct rendering. Except of that, it can contain softMask. Each layer can be connected to
 * to the soft mask in Resources.
 * In illustrator exists special layer type called xObject (with types Form and Image) and has 2 parts.  One part is as regular layer and by default it has
 * 2nd part in resources (ResourcesXObject). ResourcesXObject has same typings as soft mask which can be connected to each layer.
 * Also, ResourcesXObject can have children. Therefore OctopusLayerSoftMaskGroup (soft mask) has mask section defined as a group (
 * not working yet in rendering). These children however have their own resources which are located in ResourcesXObject.
 *  There is no optimalization for soft masks. If layer has a soft mask new OctopusLayerSoftMaskGroup is
 * created.
 */
export function createOctopusLayer({
  layerSequences,
  layerSequences: [layerSequence],
  parent,
}: CreateOctopusLayerOptions): Nullish<OctopusLayer> {
  const {
    sourceLayers: [sourceLayer],
  } = layerSequence

  if (sourceLayer.softMask) {
    return createOctopusLayerSoftMaskGroup({ layerSequence, parent })
  }

  if ('mask' in sourceLayer && sourceLayer.mask) {
    return createOctopusLayerMaskGroup({ parent, layerSequences })
  }

  return buildOctopusLayer({ parent, layerSequence })
}
