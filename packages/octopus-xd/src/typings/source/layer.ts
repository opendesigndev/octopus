import type { RawTextLayer } from '.'
import type { RawGroupLayer } from './group-layer'
import type { RawShapeLayer } from './shape-layer'
import type { RawShapeMaskGroupLayer } from './shape-mask-group-layer'
import type { RawStyle } from './style'
import type { RawTransform } from './transform'
import type { RawVisualBounds } from './visual-bounds'

export type RawLayerCommon = {
  visible?: boolean
  name?: string
  id?: string
  syncSourceGuid?: string
  guid?: string
  transform?: RawTransform
  meta?: {
    ux?: {
      fixed?: boolean
      states?: RawLayer[]
    }
  }
  style?: RawStyle
  visualBounds?: RawVisualBounds
}

export type RawLayer = RawGroupLayer | RawShapeLayer | RawShapeMaskGroupLayer | RawTextLayer
