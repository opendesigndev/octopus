import type { SourceLayerType } from '../../entities/source/source-layer-common'
import type { RawlayerEffects, RawFill } from './effects'
import type { RawShapeStrokeStyle, VectorMaskSetting } from './layer-shape'
import type { RawTextProperties } from './layer-text'
import type { VectorOriginationData } from './path-component'
import type { RawColor, RawBounds } from './shared'
import type { Group, Layer } from '@webtoon/psd'

export type RawLayerCommon = {
  isArtboard: boolean
  id: string
  name: string
  artboardBackgroundType: number
  isHidden: boolean
}

export type LayerPropertiesArtboard = Partial<{
  artboardBackgroundType: number
  Clr: RawColor
  artboardPresentName: string
  artboardRect: RawBounds
}>

export type FillOpacity = Partial<{
  fillOpacity: number
}>

export type RawLayerBlendProps = Partial<{
  signature: string
  key: string
  dividerType: number
  dividerSignature: string
  blendMode: string
  subType: number
}>

//todo could not invoke smartObject (SoLd and SolE)
export type LayerProperties = Partial<{
  lyid: number | string
  artb: LayerPropertiesArtboard
  iOpa: FillOpacity
  lfx2: RawlayerEffects
  SoCo: RawFill
  GdFl: RawFill
  vscg: RawFill
  vstk: RawShapeStrokeStyle
  TySh: RawTextProperties
  vmsk: VectorMaskSetting
  vsms: VectorMaskSetting
  vogk: VectorOriginationData
  lsct: RawLayerBlendProps
  lsdk: RawLayerBlendProps
  lnsr: Uint8Array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SoLd: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SoLe: any
}>

export type AddedType<T extends SourceLayerType> = { addedType: T }
export type NodeChildWithType = (ParsedLayerGroup | ParsedLayerLayer) & AddedType<SourceLayerType>
export type NodeChildWithProps = ParsedLayerGroup | ParsedLayerLayer

export type ParsedLayerLayer = Partial<Layer> & {
  layerProperties?: LayerProperties
}

export type ParsedLayerGroup = Partial<Exclude<Group, 'children'>> & {
  children: NodeChildWithProps[]
  layerProperties?: LayerProperties
}
