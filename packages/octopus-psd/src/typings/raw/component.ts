import type { RawLayerProperties, RawNodeChildWithProps } from './layer.js'
import type Psd from '@webtoon/psd-ts'

export type RawParsedPsd = Psd & { children: RawNodeChildWithProps[] } & {
  layerProperties: RawLayerProperties
}
