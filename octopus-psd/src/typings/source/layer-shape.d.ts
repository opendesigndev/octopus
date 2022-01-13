import type { RawBounds } from './shared'
import type { RawLayerCommon } from './layer'

export type RawShapeMask = {
  bounds?: RawBounds
  extendWithWhite?: boolean
  imageName?: string
}

export type RawShapePath = {
  bounds?: RawBounds
  defaultFill?: boolean
  pathComponents?: []
}

export type RawLayerShape = RawLayerCommon & {
  type?: 'shapeLayer'
  alignEdges?: boolean
  fill?: {}
  layerEffects?: {}
  mask?: RawShapeMask
  path?: RawShapePath
}
