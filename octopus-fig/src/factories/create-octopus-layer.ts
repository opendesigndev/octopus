import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { OctopusLayerParent } from '../entities/octopus/octopus-layer-base'
import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import { SourceLayerFrame } from '../entities/source/source-layer-frame'
import { logWarn } from '../services/instances/misc'

import type { SourceLayer } from './create-source-layer'

export type OctopusLayer = OctopusLayerGroup | OctopusLayerMaskGroup // TODO | OctopusLayerText | OctopusLayerShape

type OctopusLayerBuilders = typeof createOctopusLayerGroup | typeof createOctopusLayerSlice // TODO

type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

const OCTOPUS_BUILDER_MAP: { [key: string]: OctopusLayerBuilders } = {
  FRAME: createOctopusLayerGroup,
  SLICE: createOctopusLayerSlice,
  RECTANGLE: createOctopusLayerTODO,
  LINE: createOctopusLayerTODO,
  VECTOR: createOctopusLayerTODO,
  ELLIPSE: createOctopusLayerTODO,
  REGULAR_POLYGON: createOctopusLayerTODO,
  STAR: createOctopusLayerTODO,
  TEXT: createOctopusLayerTODO,
} as const

function createOctopusLayerGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
  const sourceLayer = layer as SourceLayerFrame
  return new OctopusLayerGroup({ parent, sourceLayer })
}

function createOctopusLayerSlice(): null {
  return null // slices are not part of octopus3 format
}

function createOctopusLayerTODO(): null {
  return null
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
