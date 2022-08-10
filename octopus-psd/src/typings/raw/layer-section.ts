import type { RawLayer, RawLayerCommon } from './layer.js'

export type RawLayerSection = RawLayerCommon & {
  type?: 'layerSection'
  layers?: RawLayer[]
}
