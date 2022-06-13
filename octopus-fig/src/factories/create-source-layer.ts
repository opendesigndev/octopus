import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { SourceLayerFrame } from '../entities/source/source-layer-frame'
import { SourceLayerShape } from '../entities/source/source-layer-shape'
import { SourceLayerText } from '../entities/source/source-layer-text'
import { logWarn } from '../services/instances/misc'

import type { SourceLayerParent } from '../entities/source/source-layer-common'
import type { RawLayer, RawLayerShape, RawLayerFrame, RawLayerText, RawSlice } from '../typings/raw'

export type SourceLayer = SourceLayerFrame | SourceLayerShape | SourceLayerText

type SourceLayerBuilders =
  | typeof createLayerFrame
  | typeof createLayerShape
  | typeof createLayerText
  | typeof createLayerSlice

type CreateLayerOptions = {
  layer: RawLayer | RawSlice
  parent: SourceLayerParent
}

const SOURCE_BUILDER_MAP: { [key: string]: SourceLayerBuilders | undefined } = {
  FRAME: createLayerFrame,
  BOOLEAN_OPERATION: createLayerShape,
  ELLIPSE: createLayerShape,
  LINE: createLayerShape,
  RECTANGLE: createLayerShape,
  REGULAR_POLYGON: createLayerShape,
  STAR: createLayerShape,
  VECTOR: createLayerShape,
  TEXT: createLayerText,
  SLICE: createLayerSlice,
  // GROUP: createTODO,
  // INSTANCE: createTODO,
} as const

function createLayerFrame({ layer, parent }: CreateLayerOptions): SourceLayerFrame {
  return new SourceLayerFrame({ parent, rawValue: layer as RawLayerFrame })
}

function createLayerShape({ layer, parent }: CreateLayerOptions): SourceLayerShape {
  return new SourceLayerShape({ parent, rawValue: layer as RawLayerShape })
}

function createLayerText({ layer, parent }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({ parent, rawValue: layer as RawLayerText })
}

function createLayerSlice(): null {
  return null // slices are not part of octopus3 format
}

export function createSourceLayer(options: CreateLayerOptions): SourceLayer | null {
  const type = (Object(options.layer) as RawLayer | RawSlice).type
  const builder = getMapped(type, SOURCE_BUILDER_MAP, undefined)
  if (typeof builder !== 'function') {
    logWarn('createSourceLayer: Unknown layer type', { type })
    return null
  }
  return builder(options)
}
