import type { RawLayerCommon } from './index.js'
import type { RawLayer } from './layer.js'
import type { RawTransform } from './transform.js'

export type RawRepeatGrid = {
  width?: number
  height?: number
  paddingX?: number
  paddingY?: number
  cellWidth?: number
  cellHeight?: number
  columns?: number
  rows?: number
}

export type RawGroupLayerMeta = {
  ux?: {
    nameL10N?: 'SHAPE_GROUP' | 'SHAPE_MASK'
    localTransform?: RawTransform
    repeatGrid?: RawRepeatGrid
    hasCustomName?: boolean
    constraintWidth?: boolean
    constraintRight?: boolean
    constraintHeight?: boolean
    scrollingType?: 'horizontal' | 'vertical' | 'panning'
    offsetX?: number
    viewportWidth?: number
    offsetY?: number
    viewportHeight?: number
  }
}

export type RawGroupLayer = RawLayerCommon & {
  type?: 'group'
  meta?: RawGroupLayerMeta
  group?: {
    children?: RawLayer[]
  }
}
