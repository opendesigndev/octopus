import { RawLayerCommon, RawLayer } from './layer'

export type RawSectionLayer = RawLayerCommon & {
  type?: 'layerSection'
  blendOptions: {
    mode: string
  }
  layers: [RawLayer]
}
