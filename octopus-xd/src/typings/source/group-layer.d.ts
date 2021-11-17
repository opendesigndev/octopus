import { RawLayer } from './layer'
import { RawTransform } from './transform'

export type RawGroupLayerMeta = {
  ux?: {
    nameL10N?: 'SHAPE_GROUP',
    localTransform?: RawTransform
  }
}

export type RawGroupLayer = {
  type?: 'group',
  name?: string,
  meta?: RawGroupLayerMeta,
  id?: string,
  transform?: RawTransform,
  group?: {
    children?: RawLayer[]
  }
}