import SourceLayerGroup from '../entities/source/source-layer-group.js'
import SourceLayerShape from '../entities/source/source-layer-shape.js'
import SourceLayerText from '../entities/source/source-layer-text.js'

import type { SourceLayerParent } from '../entities/source/source-layer-common.js'
import type { RawGroupLayer, RawTextLayer } from '../typings/raw/index.js'
import type { RawLayer } from '../typings/raw/layer.js'
import type { RawShapeLayer } from '../typings/raw/shape-layer.js'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

export type SourceLayer = SourceLayerGroup | SourceLayerText | SourceLayerShape
type Builder = (options: CreateLayerOptions) => SourceLayer

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

export function createSourceLayer(options: CreateLayerOptions): Nullable<SourceLayer> {
  const type = (Object(options.layer) as RawLayer).Type
  const builders: { [key: string]: Builder } = {
    Path: createSourceLayerShape,
    TextGroup: createSourceLayerText,
    MarkedContext: createSourceLayerGroup,
    Shading: createSourceLayerShape,
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}
