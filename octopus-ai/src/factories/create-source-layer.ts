import SourceLayerGroup from '../entities-source/source-layer-group'

import SourceLayerShape from '../entities-source/source-layer-shape'
// import SourceLayerText from '../entities-source/source-layer-text'

import SourceArtboard from "../entities-source/source-artboard"
import { RawArtboardEntry } from "../typings/source/artboard"
import { RawLayer } from "../typings/source/layer"
import { RawShapeLayer } from '../typings/source/shape-layer'
import type { SourceLayerParent } from '../entities-source/source-layer-common'
import { RawGroupLayer, RawTextLayer } from '../typings/source'
import SourceLayerText from '../entities-source/source-layer-text'

export type SourceLayer = SourceLayerGroup | SourceLayerText | SourceLayerShape

type CreateLayerOptions = {
  layer: RawLayer,
  parent: SourceLayerParent,
  path: number[]
}

function createSourceLayerGroup({ layer, parent,path }: CreateLayerOptions): SourceLayerGroup {
  return new SourceLayerGroup({
    parent,
    rawValue: layer as RawGroupLayer,
    path
  })
}

function createSourceLayerShape({ layer, parent, path }: CreateLayerOptions): SourceLayerShape {
  return new SourceLayerShape({
    parent,
    path,
    rawValue: layer as RawShapeLayer
  })
}

function createSourceLayerText({ layer, parent, path }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({
    parent,
    rawValue: layer as RawTextLayer,
    path
  })
}

export function createSourceLayer(options: CreateLayerOptions): SourceLayer | null  {
  const type = (Object(options.layer) as RawLayer).Type
  const builders: { [key: string]: Function } = {
    Path: createSourceLayerShape,
    TextGroup: createSourceLayerText,
    MarkedContext: createSourceLayerGroup
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}

