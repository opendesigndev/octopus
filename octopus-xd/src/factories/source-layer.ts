import { RawGroupLayer, RawLayer, RawShapeLayer } from '../typings/source'
import SourceArtboard from '../entities/source-artboard'
import SourceLayerGroup from '../entities/source-layer-group'
import SourceLayerShape from '../entities/source-layer-shape'


export type SourceLayer = SourceLayerGroup | SourceLayerShape

type CreateLayerOptions = {
  layer: RawLayer,
  parent: SourceArtboard | SourceLayerGroup
}

function createSourceLayerGroup({ layer, parent }: CreateLayerOptions): SourceLayerGroup {
  return new SourceLayerGroup({
    parent,
    rawValue: layer as RawGroupLayer
  })
}

function createSourceLayerShape({ layer, parent }: CreateLayerOptions): SourceLayerShape {
  return new SourceLayerShape({
    parent,
    rawValue: layer as RawShapeLayer
  })
}

export function createSourceLayer(options: CreateLayerOptions): SourceLayer | null {
  const type = (Object(options.layer) as RawLayer).type
  const builders: { [key: string]: Function } = {
    group: createSourceLayerGroup,
    shape: createSourceLayerShape
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}

