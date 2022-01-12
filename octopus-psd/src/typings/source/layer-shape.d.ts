import { RawBounds } from './bounds'
import { RawLayerCommon } from './layer'

export type RawShapeLayer = RawLayerCommon & {
  type?: 'shapeLayer'
  alignEdges?: boolean
  fill?: {}
  layerEffects?: {}
  mask?: {
    bounds?: RawBounds
    extendWithWhite?: boolean
    imageName?: string
  }
  path?: {
    bounds?: RawBounds
    defaultFill?: boolean
    pathComponents?: []
  }
}
