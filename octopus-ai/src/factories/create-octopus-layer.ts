import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape'
import { OctopusLayerShapeShapeAdapter } from '../entities/octopus/octopus-layer-shape-shape-adapter'
import { OctopusLayerShapeXObjectImageAdapter } from '../entities/octopus/octopus-layer-shape-x-object-image-adapter'
import { OctopusLayerSoftMaskGroup } from '../entities/octopus/octopus-layer-soft-mask-group'
import { OctopusLayerText } from '../entities/octopus/octopus-layer-text'
import { getMaskGroupHashKey } from '../utils/mask'

import type { SourceLayerWithSoftMask } from '../entities/octopus/octopus-layer-soft-mask-group'
import type { SourceLayerGroup } from '../entities/source/source-layer-group'
import type { SourceLayerShape } from '../entities/source/source-layer-shape'
import type { SourceLayerText } from '../entities/source/source-layer-text'
import type { SourceLayerXObjectForm } from '../entities/source/source-layer-x-object-form'
import type { SourceLayerXObjectImage } from '../entities/source/source-layer-x-object-image'
import type { OctopusLayerParent } from '../typings/octopus-entities'
import type { ClippedSourceLayer, SourceLayer } from './create-source-layer'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

export type OctopusLayer =
  | OctopusLayerGroup
  | OctopusLayerShape
  | OctopusLayerText
  | OctopusLayerMaskGroup
  | OctopusLayerSoftMaskGroup

export type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

export function createOctopusLayerGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
  return new OctopusLayerGroup({
    parent,
    sourceLayer: layer as SourceLayerGroup | SourceLayerXObjectForm,
  })
}

export function createOctopusLayerMaskGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerMaskGroup {
  return new OctopusLayerMaskGroup({
    parent,
    sourceLayer: layer as SourceLayerShape,
  })
}

export function createOctopusLayerShapeFromShapeAdapter({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape {
  const adapter = new OctopusLayerShapeShapeAdapter({ parent, sourceLayer: layer as SourceLayerShape })
  return new OctopusLayerShape({ adapter })
}

export function createOctopusLayerShapeFromXObjectImageAdapter({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape {
  const adapter = new OctopusLayerShapeXObjectImageAdapter({ parent, sourceLayer: layer as SourceLayerXObjectImage })
  return new OctopusLayerShape({ adapter })
}

export function createOctopusLayerSoftMaskGroup({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerSoftMaskGroup {
  return new OctopusLayerSoftMaskGroup({ sourceLayer: layer as SourceLayerWithSoftMask, parent })
}

function createOctopusLayerText({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerText {
  return new OctopusLayerText({
    parent,
    sourceLayer: layer as SourceLayerText,
  })
}

type Builder = (options: CreateOctopusLayerOptions) => OctopusLayer

export function buildOctopusLayer(options: CreateOctopusLayerOptions): Nullable<OctopusLayer> {
  const type = (Object(options.layer) as SourceLayer).type || ''
  const builders: {
    [key: string]: Builder
  } = {
    MarkedContext: createOctopusLayerGroup,
    Form: createOctopusLayerGroup,
    Path: createOctopusLayerShapeFromShapeAdapter,
    TextGroup: createOctopusLayerText,
    Image: createOctopusLayerShapeFromXObjectImageAdapter,
    Shading: createOctopusLayerShapeFromShapeAdapter,
  }
  const builder = builders[type]
  return typeof builder === 'function' ? builder(options) : null
}

type GetClippingMaskGroupOptions = {
  mask: SourceLayerShape
  parent: OctopusLayerParent
}

function doesMaskGroupExist(maskGroupHashKey: string | null) {
  return Boolean(maskGroupHashKey && OctopusLayerMaskGroup.registry[maskGroupHashKey])
}

function getClippingMaskGroup({ mask, parent }: GetClippingMaskGroupOptions): {
  maskGroup: OctopusLayerMaskGroup | null
  maskGroupHashKey: string | null
} {
  const maskGroupHashKey = getMaskGroupHashKey(mask)
  const maskGroupExists = doesMaskGroupExist(maskGroupHashKey)

  const maskGroup =
    maskGroupExists && maskGroupHashKey
      ? OctopusLayerMaskGroup.registry[maskGroupHashKey]
      : createOctopusLayerMaskGroup({ layer: mask, parent })

  return { maskGroupHashKey, maskGroup }
}

/** there are 2 types of masks in AI: clip mask and so called soft mask which masks layer with its colors.
 * In source files, each layer can have ClippingPath property in its GraphicsState. This ClippingPath serves as
 * a clip mask.
 * As one layer can mask several layers, each of these layers can have identical ClippingPath. That is why I create OctopusLayerMaskGroup(clip mask)
 * from source ClippingPath where ClippingPath serves as a mask and layer as a child. If other layer has same ClippingPath, it is
 * added to the existing OctopusLayerMaskGroup as a child.
 * To find out whether the ClippingPath is the same, I create hashKey as identifier for each new OctopusLayerMaskGroup from path sourcePaths.
 *
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
export function createOctopusLayer(options: CreateOctopusLayerOptions): Nullable<OctopusLayer> {
  const { layer, parent } = options

  if (layer.softMask) {
    return createOctopusLayerSoftMaskGroup({ layer, parent })
  }

  const clippedLayer = options.layer as ClippedSourceLayer

  const { mask } = clippedLayer

  if (!mask) {
    return buildOctopusLayer(options)
  }

  const { maskGroup, maskGroupHashKey } = getClippingMaskGroup({ parent, mask })

  if (maskGroup) {
    maskGroup.addChildLayerToMaskGroup(clippedLayer)
  }

  if (doesMaskGroupExist(maskGroupHashKey)) {
    return null
  }

  if (maskGroupHashKey && maskGroup) {
    OctopusLayerMaskGroup.registerMaskGroup(maskGroupHashKey, maskGroup)
  }

  return maskGroup
}
