import SourceLayerGroup from '../entities-source/source-layer-group'
import SourceLayerShape from '../entities-source/source-layer-shape'
import SourceLayerText from '../entities-source/source-layer-text'

import type { Nullable } from '../typings/helpers'
import type { SourceLayerParent } from '../entities-source/source-layer-common'
import type { RawGroupLayer, RawTextLayer } from '../typings/source'
import type { RawLayer } from '../typings/source/layer'
import type { RawShapeLayer } from '../typings/source/shape-layer'

export type SourceLayer = SourceLayerGroup | SourceLayerText | SourceLayerShape

type CreateLayerOptions = {
  layer: RawLayer
  parent: SourceLayerParent
  path: number[]
}

function createSourceLayerGroup({ layer, parent, path }: CreateLayerOptions): SourceLayerGroup {
  return new SourceLayerGroup({
    parent,
    rawValue: layer as RawGroupLayer,
    path,
  })
}

export function createSourceLayerShape({ layer, parent, path }: CreateLayerOptions): SourceLayerShape {
  return new SourceLayerShape({
    parent,
    path,
    rawValue: layer as RawShapeLayer,
  })
}

export function createSourceLayerText({ layer, parent, path }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({
    parent,
    rawValue: layer as RawTextLayer,
    path,
  })
}

type Builder = (options: CreateLayerOptions) => SourceLayer
export function createSourceLayer(options: CreateLayerOptions): Nullable<SourceLayer> {
  const type = (Object(options.layer) as RawLayer).Type
  const builders: { [key: string]: Builder } = {
    Path: createSourceLayerShape,
    TextGroup: createSourceLayerText,
    MarkedContext: createSourceLayerGroup,
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}
