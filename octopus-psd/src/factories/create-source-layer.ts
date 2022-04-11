import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { SourceLayerAdjustment } from '../entities/source/source-layer-adjustment'
import { SourceLayerBackground } from '../entities/source/source-layer-background'
import type { SourceLayerParent } from '../entities/source/source-layer-common'
import { SourceLayerLayer } from '../entities/source/source-layer-layer'
import { SourceLayerSection } from '../entities/source/source-layer-section'
import { SourceLayerShape } from '../entities/source/source-layer-shape'
import { SourceLayerText } from '../entities/source/source-layer-text'
import { logWarn } from '../services/instances/misc'
import type {
  RawLayer,
  RawLayerAdjustment,
  RawLayerBackground,
  RawLayerLayer,
  RawLayerSection,
  RawLayerShape,
  RawLayerText,
} from '../typings/raw'

export type SourceLayer =
  | SourceLayerSection
  | SourceLayerShape
  | SourceLayerText
  | SourceLayerBackground
  | SourceLayerLayer
  | SourceLayerAdjustment

type SourceLayerBuilders =
  | typeof createLayerSection
  | typeof createLayerShape
  | typeof createLayerText
  | typeof createLayerBackground
  | typeof createLayerLayer
  | typeof createLayerAdjustment

type CreateLayerOptions = {
  layer: RawLayer
  parent: SourceLayerParent
}

const SOURCE_BUILDER_MAP: { [key: string]: SourceLayerBuilders } = {
  layerSection: createLayerSection,
  shapeLayer: createLayerShape,
  textLayer: createLayerText,
  backgroundLayer: createLayerBackground,
  layer: createLayerLayer,
  adjustmentLayer: createLayerAdjustment,
} as const

function createLayerSection({ layer, parent }: CreateLayerOptions): SourceLayerSection {
  return new SourceLayerSection({ parent, rawValue: layer as RawLayerSection })
}

function createLayerShape({ layer, parent }: CreateLayerOptions): SourceLayerShape {
  return new SourceLayerShape({ parent, rawValue: layer as RawLayerShape })
}

function createLayerText({ layer, parent }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({ parent, rawValue: layer as RawLayerText })
}

function createLayerBackground({ layer, parent }: CreateLayerOptions): SourceLayerBackground {
  return new SourceLayerBackground({ parent, rawValue: layer as RawLayerBackground })
}

function createLayerLayer({ layer, parent }: CreateLayerOptions): SourceLayerLayer {
  return new SourceLayerLayer({ parent, rawValue: layer as RawLayerLayer })
}

function createLayerAdjustment({ layer, parent }: CreateLayerOptions): SourceLayerAdjustment {
  return new SourceLayerAdjustment({ parent, rawValue: layer as RawLayerAdjustment })
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
