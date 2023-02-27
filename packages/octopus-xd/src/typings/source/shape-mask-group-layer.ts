import type { RawLayerCommon, RawShapeLayer } from './index.js'
import type { RawLayer } from './layer.js'
import type { RawTransform } from './transform.js'

export type RawClipPathResources = {
  children?: RawShapeLayer[]
  type?: 'clipPath'
}

export type RawShapeMaskGroupLayerMeta = {
  ux?: {
    nameL10N?: 'SHAPE_MASK'
    clipPathResources?: RawClipPathResources
    localTransform?: RawTransform
  }
}

export type RawShapeMaskGroupLayer = RawLayerCommon & {
  type?: 'group'
  meta?: RawShapeMaskGroupLayerMeta
  group?: {
    children?: RawLayer[]
  }
}
