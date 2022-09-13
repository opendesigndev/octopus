import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape'
import { OctopusLayerText } from '../entities/octopus/octopus-layer-text'
import { logger } from '../services'

import type { OctopusLayerParent } from '../entities/octopus/octopus-layer-base'
import type { SourceLayerFrame } from '../entities/source/source-layer-frame'
import type { SourceLayerShape } from '../entities/source/source-layer-shape'
import type { SourceLayerText } from '../entities/source/source-layer-text'
import type { SourceLayer } from './create-source-layer'

export type OctopusLayer = OctopusLayerGroup | OctopusLayerMaskGroup | OctopusLayerShape | OctopusLayerText

type OctopusLayerBuilders =
  | typeof createOctopusLayerGroupLike
  | typeof createOctopusLayerShape
  | typeof createOctopusLayerText
  | typeof createOctopusLayerSlice

type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

const OCTOPUS_BUILDER_MAP: { [key: string]: OctopusLayerBuilders | undefined } = {
  FRAME: createOctopusLayerGroupLike,
  GROUP: createOctopusLayerGroupLike,
  INSTANCE: createOctopusLayerGroupLike,
  COMPONENT: createOctopusLayerGroupLike,
  COMPONENT_SET: createOctopusLayerGroupLike,
  SHAPE: createOctopusLayerShape,
  TEXT: createOctopusLayerText,
  SLICE: createOctopusLayerSlice,
} as const

function createOctopusLayerGroupLike({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerGroup | OctopusLayerMaskGroup | null {
  const sourceLayer = layer as SourceLayerFrame
  if (sourceLayer.hasBackgroundMask) {
    return OctopusLayerMaskGroup.createBackgroundMaskGroup({ parent, sourceLayer })
  }
  return new OctopusLayerGroup({ parent, sourceLayer })
}

function createOctopusLayerShape({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
  const sourceLayer = layer as SourceLayerShape
  return new OctopusLayerShape({ parent, sourceLayer })
}

function createOctopusLayerText({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerText {
  const sourceLayer = layer as SourceLayerText
  return new OctopusLayerText({ parent, sourceLayer })
}

function createOctopusLayerSlice(): null {
  return null // slices are not part of octopus3 format
}

export function createOctopusLayer(options: CreateOctopusLayerOptions): OctopusLayer | null {
  const type = options.layer.type
  const builder = getMapped(type, OCTOPUS_BUILDER_MAP, undefined)
  if (!builder) {
    logger?.warn('createOctopusLayer: Unknown layer type', { type })
    return null
  }
  return builder(options)
}

export function createClippingMask(
  parent: OctopusLayerParent,
  mask: OctopusLayer,
  layers: OctopusLayer[],
  isMaskOutline: boolean
): OctopusLayerMaskGroup | null {
  return isMaskOutline
    ? OctopusLayerMaskGroup.createClippingMaskOutline({ parent, mask, layers })
    : OctopusLayerMaskGroup.createClippingMask({ parent, mask, layers })
}

function isMaskBreaker(sourceLayer: SourceLayer) {
  return sourceLayer.type === 'FRAME' || !sourceLayer.visible
}

/**
 * Split layers into groups.
 * Group layers clipped by mask layer.
 * Clipping mask is the first one in it's group.
 */
function intoGroups(layers: SourceLayer[]): SourceLayer[][] {
  const groupCandidates = [...layers].reduce((candidates, layer, index) => {
    if (index === 0 || layer.isMask) candidates.push([])
    candidates[candidates.length - 1].push(layer)
    return candidates
  }, [] as SourceLayer[][])

  return groupCandidates
    .reduce((groups, candidate) => {
      let maskContext = candidate[0].isMask
      const subGroups = candidate.reduce((subGroups, layer, index) => {
        if (index === 0 || isMaskBreaker(layer) || !maskContext) subGroups.push([])
        if (isMaskBreaker(layer)) maskContext = false
        subGroups[subGroups.length - 1].push(layer)
        return subGroups
      }, [] as SourceLayer[][])
      groups.push(subGroups)
      return groups
    }, [] as SourceLayer[][][])
    .flat(1)
}

export function createOctopusLayers(layers: SourceLayer[], parent: OctopusLayerParent): OctopusLayer[] {
  const groups = intoGroups(layers)
  return groups
    .map((group) => {
      if (group[0].isMask) {
        const [sourceMask, ...sourceMaskLayers] = group
        const mask = createOctopusLayer({ parent, layer: sourceMask })
        if (!mask) return null
        const maskLayers = sourceMaskLayers
          .map((layer) => createOctopusLayer({ parent, layer }))
          .filter((layer): layer is OctopusLayer => Boolean(layer))
        return createClippingMask(parent, mask, maskLayers, sourceMask.isMaskOutline)
      }
      return createOctopusLayer({ parent, layer: group[0] })
    })
    .filter((layer): layer is OctopusLayer => Boolean(layer))
}
