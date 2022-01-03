import { RawGroupLayer, RawLayer, RawShapeLayer, RawTextLayer } from '../typings/source'
import SourceLayerGroup from '../entities/source-layer-group'
import SourceLayerShape from '../entities/source-layer-shape'
import { SourceLayerParent } from '../entities/source-layer-common'
import SourceLayerText from '../entities/source-layer-text'


export type SourceLayer = SourceLayerGroup | SourceLayerShape | SourceLayerText

type CreateLayerOptions = {
  layer: RawLayer,
  parent: SourceLayerParent
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

function createSourceLayerText({ layer, parent }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({
    parent,
    rawValue: layer as RawTextLayer
  })
}

export function createSourceLayer(options: CreateLayerOptions): SourceLayer | null {
  const type = (Object(options.layer) as RawLayer).type
  const builders: { [key: string]: Function } = {
    group: createSourceLayerGroup,
    shape: createSourceLayerShape,
    text: createSourceLayerText
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}

