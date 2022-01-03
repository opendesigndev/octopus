import type { RawShapeLayer } from './shape-layer'
import type { RawGroupLayer } from './group-layer'
import type { RawTransform } from './transform'
import { RawStyle } from './style'
import { RawShapeMaskGroupLayer } from './shape-mask-group-layer'
import { RawVisualBounds } from './visual-bounds'
import { RawTextLayer } from '.'


export type RawLayerCommon = {
  visible?: boolean,
  name?: string,
  id?: string,
  syncSourceGuid?: string,
  guid?: string,
  transform?: RawTransform,
  meta?: {
    ux?: {
      fixed?: boolean
    }
  },
  style?: RawStyle,
  visualBounds?: RawVisualBounds
}

export type RawLayer = 
  | RawGroupLayer
  | RawShapeLayer
  | RawShapeMaskGroupLayer
  | RawTextLayer