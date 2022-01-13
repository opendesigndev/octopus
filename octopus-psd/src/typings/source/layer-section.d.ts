import type { RawLayerCommon, RawLayer } from './layer'

export type RawLayerSection = RawLayerCommon & {
  type?: 'layerSection'
  blendOptions: {
    mode: string
  }
  layers: RawLayer[]
}
