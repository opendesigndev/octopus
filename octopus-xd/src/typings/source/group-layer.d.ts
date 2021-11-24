import type { RawLayerCommon } from '.'
import type { RawLayer } from './layer'
import type { RawTransform } from './transform'

export type RawGroupLayerMeta = {
  ux?: {
    nameL10N?: 'SHAPE_GROUP',
    localTransform?: RawTransform
  }
}

export type RawGroupLayer = RawLayerCommon & {
  type?: 'group',
  meta?: RawGroupLayerMeta,
  group?: {
    children?: RawLayer[]
  }
}