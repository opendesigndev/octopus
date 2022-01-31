// import SourceLayerGroup from '../entities-source/source-layer-group'
// import SourceLayerShape from '../entities-source/source-layer-shape'
// import SourceLayerText from '../entities-source/source-layer-text'

//import type { RawGroupLayer, RawLayer, RawShapeLayer, RawTextLayer } from '../typings/source'
// import type { SourceLayerParent } from '../entities-source/source-layer-common'


 export type SourceLayer = any

// type CreateLayerOptions = {
//   layer: RawLayer,
//   parent: SourceLayerParent
// }

// function createSourceLayerGroup({ layer, parent }: CreateLayerOptions): SourceLayerGroup {
//   return new SourceLayerGroup({
//     parent,
//     rawValue: layer as RawGroupLayer
//   })
// }

// function createSourceLayerShape({ layer, parent }: CreateLayerOptions): SourceLayerShape {
//   return new SourceLayerShape({
//     parent,
//     rawValue: layer as RawShapeLayer
//   })
// }

// function createSourceLayerText({ layer, parent }: CreateLayerOptions): SourceLayerText {
//   return new SourceLayerText({
//     parent,
//     rawValue: layer as RawTextLayer
//   })
// }

export function createSourceLayer(options: any): any  {
  const type = (Object(options.layer)).type
  const builders: { [key: string]: Function } = {
    group: (layer:any)=>layer,
    shape: (layer:any)=>layer,
    text: (layer:any)=>layer
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}

