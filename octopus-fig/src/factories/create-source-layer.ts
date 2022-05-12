import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { SourceLayerParent } from '../entities/source/source-layer-common'
import { SourceLayerFrame } from '../entities/source/source-layer-frame'
import { logWarn } from '../services/instances/misc'
import { RawLayer, RawLayerFrame, RawSlice } from '../typings/raw'

export type SourceLayer = SourceLayerFrame // TODO | SourceLayerTODO

type SourceLayerBuilders = typeof createLayerFrame | typeof createLayerTODO // TODO

type CreateLayerOptions = {
  layer: RawLayer | RawSlice
  parent: SourceLayerParent
}

const SOURCE_BUILDER_MAP: { [key: string]: SourceLayerBuilders } = {
  FRAME: createLayerFrame,
  RECTANGLE: createLayerTODO,
  LINE: createLayerTODO,
  VECTOR: createLayerTODO,
  ELLIPSE: createLayerTODO,
  REGULAR_POLYGON: createLayerTODO,
  STAR: createLayerTODO,
  TEXT: createLayerTODO,
  SLICE: createLayerSlice,
} as const

function createLayerFrame({ layer, parent }: CreateLayerOptions): SourceLayerFrame {
  return new SourceLayerFrame({ parent, rawValue: layer as RawLayerFrame })
}

function createLayerSlice(): null {
  return null // slices are not part of octopus3 format
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createLayerTODO({ layer, parent }: CreateLayerOptions): null {
  return null // TODO
}

export function createSourceLayer(options: CreateLayerOptions): SourceLayer | null {
  const type = (Object(options.layer) as RawLayer).type
  const builder = getMapped(type, SOURCE_BUILDER_MAP, undefined)
  if (typeof builder !== 'function') {
    logWarn('createSourceLayer: Unknown layer type', { type })
    return null
  }
  return builder(options)
}
