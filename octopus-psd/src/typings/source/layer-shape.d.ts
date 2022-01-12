import { RawBounds } from './shared'
import { RawLayerCommon } from './layer'

export type RawLayerShape = RawLayerCommon & {
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
