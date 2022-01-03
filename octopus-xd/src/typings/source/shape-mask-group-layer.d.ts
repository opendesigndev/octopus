import type { RawLayerCommon, RawShapeLayer } from '.'
import type { RawLayer } from './layer'
import type { RawTransform } from './transform'

export type RawClipPathResources = {
  children?: RawShapeLayer[],
  type?: 'clipPath'
}

export type RawShapeMaskGroupLayerMeta = {
  ux?: {
    nameL10N?: 'SHAPE_MASK',
    clipPathResources?: RawClipPathResources,
    localTransform?: RawTransform
  }
}



export type RawShapeMaskGroupLayer = RawLayerCommon & {
  type?: 'group',
  meta?: RawShapeMaskGroupLayerMeta,
  group?: {
    children?: RawLayer[]
  }
}