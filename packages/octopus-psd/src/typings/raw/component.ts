import type { LayerProperties, NodeChildWithProps } from './layer'
import type Psd from '@opendesign/psd-ts'

export type ParsedPsd = Psd & { children: NodeChildWithProps[] } & {
  layerProperties: LayerProperties
}
