import type {
  RawLayer,
  RawLayerSection,
  RawLayerBackground,
  RawLayerShape,
  RawLayerText,
  RawLayerLayer,
} from '../typings/source'
import { SourceLayerSection } from '../entities/source/source-layer-section'
import { SourceLayerBackground } from '../entities/source/source-layer-background'
import { SourceLayerLayer } from '../entities/source/source-layer-layer'
import { SourceLayerShape } from '../entities/source/source-layer-shape'
import { SourceLayerText } from '../entities/source/source-layer-text'
import type { SourceLayerParent } from '../entities/source/source-layer-common'

export type SourceLayer =
  | SourceLayerSection
  | SourceLayerShape
  | SourceLayerText
  | SourceLayerBackground
  | SourceLayerLayer

type CreateLayerOptions = {
  layer: RawLayer
  parent: SourceLayerParent
}

function createLayerSection({ layer, parent }: CreateLayerOptions): SourceLayerSection {
  return new SourceLayerSection({
    parent,
    rawValue: layer as RawLayerSection,
  })
}

function createLayerShape({ layer, parent }: CreateLayerOptions): SourceLayerShape {
  return new SourceLayerShape({
    parent,
    rawValue: layer as RawLayerShape,
  })
}

function createLayerText({ layer, parent }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({
    parent,
    rawValue: layer as RawLayerText,
  })
}

function createLayerBackground({ layer, parent }: CreateLayerOptions): SourceLayerBackground {
  return new SourceLayerBackground({
    parent,
    rawValue: layer as RawLayerBackground,
  })
}

function createLayerLayer({ layer, parent }: CreateLayerOptions): SourceLayerLayer {
  return new SourceLayerLayer({
    parent,
    rawValue: layer as RawLayerLayer,
  })
}

export function createSourceLayer(options: CreateLayerOptions): SourceLayer | null {
  const type = (Object(options.layer) as RawLayer).type
  const builders: { [key: string]: Function } = {
    layerSection: createLayerSection,
    shapeLayer: createLayerShape,
    textLayer: createLayerText,
    backgroundLayer: createLayerBackground,
    layer: createLayerLayer,
  }
  const builder = builders[type as string]
  if (typeof builder !== 'function') {
    options.parent.converter?.logWarn('Unknown source layer type', { type })
    return null
  }
  return builder(options)
}
