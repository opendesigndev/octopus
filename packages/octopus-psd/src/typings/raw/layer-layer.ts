import type { AddedType, ParsedLayerLayer } from './layer'

export type RawLayerLayer = ParsedLayerLayer & AddedType<'layer'>
