import { getMapped, push } from '@avocode/octopus-common/dist/utils/common'

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
  | typeof createOctopusLayerGroup
  | typeof createOctopusLayerShape
  | typeof createOctopusLayerText
  | typeof createOctopusLayerSlice

type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

const OCTOPUS_BUILDER_MAP: { [key: string]: OctopusLayerBuilders | undefined } = {
  FRAME: createOctopusLayerGroup,
  SHAPE: createOctopusLayerShape,
  TEXT: createOctopusLayerText,
  SLICE: createOctopusLayerSlice,
} as const

function createOctopusLayerGroup({
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

export function createOctopusLayers(layers: SourceLayer[], parent: OctopusLayerParent): OctopusLayer[] {
  let mask: OctopusLayer | null = null
  let maskIsOutline = false
  let maskLayers: OctopusLayer[] = []
  const octopusLayers = layers.reduce((layers, sourceLayer) => {
    const octopusLayer = createOctopusLayer({ parent, layer: sourceLayer })

    if (!octopusLayer) return layers

    if (sourceLayer.isMask) {
      if (!sourceLayer.visible) {
        if (mask !== null) {
          const clippingMask = createClippingMask(parent, mask, maskLayers, maskIsOutline)
          mask = null
          maskIsOutline = false
          maskLayers = []
          if (!clippingMask) return push(layers, octopusLayer)
          return push(layers, clippingMask, octopusLayer)
        }
        mask = null
        maskIsOutline = false
        maskLayers = []
        return push(layers, octopusLayer)
      }
      if (mask !== null) {
        const clippingMask = createClippingMask(parent, mask, maskLayers, maskIsOutline)
        mask = octopusLayer
        maskIsOutline = sourceLayer.isMaskOutline
        maskLayers = []
        if (!clippingMask) return layers
        return push(layers, clippingMask)
      }
      mask = octopusLayer
      maskIsOutline = sourceLayer.isMaskOutline
      maskLayers = []
      return layers
    }

    if (mask !== null) {
      maskLayers.push(octopusLayer)
      return layers
    }

    return push(layers, octopusLayer)
  }, [])

  if (!mask) return octopusLayers
  const clippingMask = createClippingMask(parent, mask, maskLayers, maskIsOutline)
  if (!clippingMask) return octopusLayers
  return push(octopusLayers, clippingMask)
}
