import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import { OctopusLayerShading } from '../entities/octopus/octopus-layer-shading'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape'
import { OctopusLayerShapeShapeAdapter } from '../entities/octopus/octopus-layer-shape-shape-adapter'
import { OctopusLayerShapeXObjectImageAdapter } from '../entities/octopus/octopus-layer-shape-x-object-image-adapter'
import { OctopusLayerSoftMaskGroup } from '../entities/octopus/octopus-layer-soft-mask-group'
import { OctopusLayerText } from '../entities/octopus/octopus-layer-text'
import { getMaskGroupHashKey } from '../utils/mask'

import type { SourceLayerShape } from '../entities/source/source-layer-shape'
import type { LayerSequence } from '../services/conversion/text-layer-grouping-service'
import type { OctopusLayerParent } from '../typings/octopus-entities'
import type { SourceLayer } from './create-source-layer'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

export type OctopusLayer =
  | OctopusLayerGroup
  | OctopusLayerShape
  | OctopusLayerText
  | OctopusLayerMaskGroup
  | OctopusLayerSoftMaskGroup
  | OctopusLayerShading

export type CreateOctopusLayerOptions = {
  layerSequence: LayerSequence
  parent: OctopusLayerParent
}

export function createOctopusLayerGroup(options: CreateOctopusLayerOptions): OctopusLayerGroup {
  return new OctopusLayerGroup(options)
}

export function createOctopusLayerMaskGroup(options: CreateOctopusLayerOptions): OctopusLayerMaskGroup {
  return new OctopusLayerMaskGroup(options)
}

export function createOctopusLayerShapeFromShapeAdapter({
  layerSequence,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape {
  const adapter = new OctopusLayerShapeShapeAdapter({
    parent,
    layerSequence,
  })
  return new OctopusLayerShape({ adapter })
}

export function createOctopusLayerShading(options: CreateOctopusLayerOptions): OctopusLayerShading {
  return new OctopusLayerShading(options)
}

export function createOctopusLayerShapeFromXObjectImageAdapter({
  layerSequence,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape {
  const adapter = new OctopusLayerShapeXObjectImageAdapter({
    parent,
    layerSequence,
  })
  return new OctopusLayerShape({ adapter })
}

export function createOctopusLayerSoftMaskGroup({
  layerSequence,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerSoftMaskGroup {
  return new OctopusLayerSoftMaskGroup({
    layerSequence,
    parent,
  })
}

function createOctopusLayerText(options: CreateOctopusLayerOptions): OctopusLayerText {
  return new OctopusLayerText(options)
}

type Builder = (options: CreateOctopusLayerOptions) => OctopusLayer

export function buildOctopusLayer(options: CreateOctopusLayerOptions): Nullish<OctopusLayer> {
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

type GetClippingMaskGroupOptions = {
  mask: SourceLayerShape
  parent: OctopusLayerParent
}

function getClippingMaskGroup({ mask, parent }: GetClippingMaskGroupOptions): {
  maskGroup: OctopusLayerMaskGroup | null
  maskGroupHashKey: string | null
} {
  const maskGroupHashKey = getMaskGroupHashKey(mask)
  const maskGroupExists = OctopusLayerMaskGroup.isMaskGroupRegistered(maskGroupHashKey)

  const maskGroup =
    maskGroupExists && maskGroupHashKey
      ? OctopusLayerMaskGroup.getRegisteredMaskGroup(maskGroupHashKey)
      : createOctopusLayerMaskGroup({ layerSequence: { sourceLayers: [mask] }, parent })

  return { maskGroupHashKey, maskGroup }
}

/** there are 2 types of masks in AI: clip mask and so called soft mask which masks layer with its colors.
 * In source files, each layer can have ClippingPath property in its GraphicsState. This ClippingPath serves as
 * a clip mask.
 * As one layer can mask several layers, each of these layers can have identical ClippingPath. That is why I create OctopusLayerMaskGroup(clip mask)
 * from source ClippingPath where ClippingPath serves as a mask and layer as a child. If other layer has same ClippingPath, it is
 * added to the existing OctopusLayerMaskGroup as a child.
 * To find out whether the ClippingPath is the same, I create hashKey as identifier for each new OctopusLayerMaskGroup from path sourcePaths.
 * Also, we need to keep in mind that order of octopus layer is important. Therefore, if there is layer in between two layers which have
 * same ClippingPath, we need to create new OctopusLayerMaskGroup. This  is further complicated by the fact that child layers of OctopusLayerMaskGroup can
 * have children of their own and therefore it is impossible to set flag which signals if next layer should have its own maskGroup disregarding the hashKey
 * (static private _isNextChildLayerMaskedByNewMask in OctopusLayerMaskGroup ). To prevent child layers changing the flag, we build childLayers in point of convert.
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
export function createOctopusLayer(options: CreateOctopusLayerOptions): Nullish<OctopusLayer> {
  const { layerSequence, parent } = options

  const [layer] = layerSequence.sourceLayers

  if (layer.softMask) {
    OctopusLayerMaskGroup.setIsNextChildLayerMaskedByNewMask(true)
    return createOctopusLayerSoftMaskGroup({ layerSequence, parent })
  }

  if (!('mask' in layer) || !layer.mask) {
    OctopusLayerMaskGroup.setIsNextChildLayerMaskedByNewMask(true)
    return buildOctopusLayer(options)
  }

  const { maskGroup, maskGroupHashKey } = getClippingMaskGroup({ parent, mask: layer.mask })
  if (maskGroup) {
    maskGroup.addLayerSequence(layerSequence)
  }

  if (OctopusLayerMaskGroup.isMaskGroupRegistered(maskGroupHashKey)) {
    OctopusLayerMaskGroup.setIsNextChildLayerMaskedByNewMask(false)
    return null
  }

  if (maskGroupHashKey && maskGroup) {
    OctopusLayerMaskGroup.setIsNextChildLayerMaskedByNewMask(false)
    OctopusLayerMaskGroup.registerMaskGroup(maskGroupHashKey, maskGroup)
  }

  return maskGroup
}
