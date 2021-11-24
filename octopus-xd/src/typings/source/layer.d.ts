import type { RawShapeLayer } from './shape-layer'
import type { RawGroupLayer } from './group-layer'
import type { RawTransform } from './transform'
import { RawBlendMode } from './blend-mode'

export type RawLayerCommon = {
  visible?: boolean,
  name?: string,
  id?: string,
  transform?: RawTransform,
  meta?: {
    ux?: {
      fixed?: boolean
    }
  },
  style?: {
    blendMode?: RawBlendMode,
    opacity?: number
  }
}

export type RawLayer = 
  | RawGroupLayer
  | RawShapeLayer