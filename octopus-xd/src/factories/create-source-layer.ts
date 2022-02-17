import SourceLayerGroup from '../entities/source/source-layer-group'
import SourceLayerShape from '../entities/source/source-layer-shape'
import SourceLayerText from '../entities/source/source-layer-text'

import type { RawGroupLayer, RawLayer, RawShapeLayer, RawTextLayer } from '../typings/source'
import type { SourceLayerParent } from '../entities/source/source-layer-common'

export type SourceLayer = SourceLayerGroup | SourceLayerShape | SourceLayerText

type SourceLayerBuilders = typeof createSourceLayerGroup | typeof createSourceLayerShape | typeof createSourceLayerText

type CreateLayerOptions = {
  layer: RawLayer
  parent: SourceLayerParent
}

function createSourceLayerGroup({ layer, parent }: CreateLayerOptions): SourceLayerGroup {
  return new SourceLayerGroup({
    parent,
    rawValue: layer as RawGroupLayer,
  })
}

function createSourceLayerShape({ layer, parent }: CreateLayerOptions): SourceLayerShape {
  return new SourceLayerShape({
    parent,
    rawValue: layer as RawShapeLayer,
  })
}

function createSourceLayerText({ layer, parent }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({
    parent,
    rawValue: layer as RawTextLayer,
  })
}

export function createSourceLayer(options: CreateLayerOptions): SourceLayer | null {
  const type = (Object(options.layer) as RawLayer).type
  const builders: { [key: string]: SourceLayerBuilders } = {
    group: createSourceLayerGroup,
    shape: createSourceLayerShape,
    text: createSourceLayerText,
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}
