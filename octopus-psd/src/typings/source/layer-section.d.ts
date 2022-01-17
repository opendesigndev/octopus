import type { RawBlendOptions } from './shared'
import type { RawLayerCommon, RawLayer } from './layer'

export type RawLayerSection = RawLayerCommon & {
  type?: 'layerSection'
  blendOptions?: RawBlendOptions
  layers?: RawLayer[]
}
