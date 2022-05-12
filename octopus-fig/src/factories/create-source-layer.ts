import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { SourceLayerParent } from '../entities/source/source-layer-common'
import { SourceLayerEllipse } from '../entities/source/source-layer-ellipse'
import { SourceLayerFrame } from '../entities/source/source-layer-frame'
import { SourceLayerLine } from '../entities/source/source-layer-line'
import { SourceLayerPolygon } from '../entities/source/source-layer-polygon'
import { SourceLayerRectangle } from '../entities/source/source-layer-rectangle'
import { SourceLayerStar } from '../entities/source/source-layer-star'
import { SourceLayerText } from '../entities/source/source-layer-text'
import { SourceLayerVector } from '../entities/source/source-layer-vector'
import { logWarn } from '../services/instances/misc'
import {
  RawLayer,
  RawLayerEllipse,
  RawLayerFrame,
  RawLayerLine,
  RawLayerPolygon,
  RawLayerRectangle,
  RawLayerStar,
  RawLayerText,
  RawLayerVector,
  RawSlice,
} from '../typings/raw'

export type SourceLayer =
  | SourceLayerEllipse
  | SourceLayerFrame
  | SourceLayerLine
  | SourceLayerPolygon
  | SourceLayerRectangle
  | SourceLayerStar
  | SourceLayerText
  | SourceLayerVector

type SourceLayerBuilders =
  | typeof createLayerEllipse
  | typeof createLayerFrame
  | typeof createLayerLine
  | typeof createLayerPolygon
  | typeof createLayerRectangle
  | typeof createLayerStar
  | typeof createLayerText
  | typeof createLayerVector
  | typeof createLayerSlice

type CreateLayerOptions = {
  layer: RawLayer | RawSlice
  parent: SourceLayerParent
}

const SOURCE_BUILDER_MAP: { [key: string]: SourceLayerBuilders } = {
  ELLIPSE: createLayerEllipse,
  FRAME: createLayerFrame,
  LINE: createLayerLine,
  RECTANGLE: createLayerRectangle,
  REGULAR_POLYGON: createLayerPolygon,
  STAR: createLayerStar,
  TEXT: createLayerText,
  VECTOR: createLayerVector,
  SLICE: createLayerSlice,
} as const

function createLayerEllipse({ layer, parent }: CreateLayerOptions): SourceLayerEllipse {
  return new SourceLayerEllipse({ parent, rawValue: layer as RawLayerEllipse })
}

function createLayerFrame({ layer, parent }: CreateLayerOptions): SourceLayerFrame {
  return new SourceLayerFrame({ parent, rawValue: layer as RawLayerFrame })
}

function createLayerLine({ layer, parent }: CreateLayerOptions): SourceLayerLine {
  return new SourceLayerLine({ parent, rawValue: layer as RawLayerLine })
}

function createLayerRectangle({ layer, parent }: CreateLayerOptions): SourceLayerRectangle {
  return new SourceLayerRectangle({ parent, rawValue: layer as RawLayerRectangle })
}

function createLayerPolygon({ layer, parent }: CreateLayerOptions): SourceLayerPolygon {
  return new SourceLayerPolygon({ parent, rawValue: layer as RawLayerPolygon })
}

function createLayerStar({ layer, parent }: CreateLayerOptions): SourceLayerStar {
  return new SourceLayerStar({ parent, rawValue: layer as RawLayerStar })
}

function createLayerText({ layer, parent }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({ parent, rawValue: layer as RawLayerText })
}

function createLayerVector({ layer, parent }: CreateLayerOptions): SourceLayerVector {
  return new SourceLayerVector({ parent, rawValue: layer as RawLayerVector })
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
