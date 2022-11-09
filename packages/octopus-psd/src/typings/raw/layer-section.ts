import type { RawLayer, RawLayerCommon } from './layer'

export type RawLayerSection = RawLayerCommon & {
  type?: 'layerSection'
  layers?: RawLayer[]
}
