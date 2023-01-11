import type { LayerProperties, NodeChildWithProps } from './layer'
import type Psd from '@webtoon/psd-ts'

export type ParsedPsd = Psd & { children: NodeChildWithProps[] } & {
  layerProperties: LayerProperties
}
