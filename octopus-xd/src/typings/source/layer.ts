import type { RawGroupLayer } from './group-layer.js'
import type { RawTextLayer } from './index.js'
import type { RawShapeLayer } from './shape-layer.js'
import type { RawShapeMaskGroupLayer } from './shape-mask-group-layer.js'
import type { RawStyle } from './style.js'
import type { RawTransform } from './transform.js'
import type { RawVisualBounds } from './visual-bounds.js'

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
