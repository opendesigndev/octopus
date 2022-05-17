import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape'
import { OctopusLayerText } from '../entities/octopus/octopus-layer-text'
import { logWarn } from '../services/instances/misc'

import type { OctopusLayerParent } from '../entities/octopus/octopus-layer-base'
import type { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
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

const OCTOPUS_BUILDER_MAP: { [key: string]: OctopusLayerBuilders } = {
  FRAME: createOctopusLayerGroup,
  SHAPE: createOctopusLayerShape,
  TEXT: createOctopusLayerText,
  SLICE: createOctopusLayerSlice,
} as const

function createOctopusLayerGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
  const sourceLayer = layer as SourceLayerFrame
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
    logWarn('createOctopusLayer: Unknown layer type', { type })
    return null
  }
  return builder(options)
}

export function createOctopusLayers(layers: SourceLayer[], parent: OctopusLayerParent): OctopusLayer[] {
  return layers.reduce((layers, sourceLayer) => {
    const octopusLayer = createOctopusLayer({ parent, layer: sourceLayer })
    return octopusLayer ? [octopusLayer, ...layers] : layers
  }, [])
}
