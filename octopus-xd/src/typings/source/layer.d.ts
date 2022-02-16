import type { RawShapeLayer } from './shape-layer'
import type { RawGroupLayer } from './group-layer'
import type { RawTransform } from './transform'
import type { RawStyle } from './style'
import type { RawShapeMaskGroupLayer } from './shape-mask-group-layer'
import type { RawVisualBounds } from './visual-bounds'
import type { RawTextLayer } from '.'

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
    }
  }
  style?: RawStyle
  visualBounds?: RawVisualBounds
}

export type RawLayer = RawGroupLayer | RawShapeLayer | RawShapeMaskGroupLayer | RawTextLayer
