import type { RawlayerEffects, RawFill } from './effects.js'
import type { RawShapeStrokeStyle, RawVectorMaskSetting } from './layer-shape.js'
import type { RawTextProperties } from './layer-text.js'
import type { RawVectorOriginationData } from './path-component.js'
import type { RawColor, RawBounds } from './shared.js'
import type { SourceLayerType } from '../../entities/source/source-layer-common.js'
import type { Group, Layer } from '@webtoon/psd-ts'

export type RawLayerCommon = {
  isArtboard: boolean
  id: string
  name: string
  artboardBackgroundType: number
  isHidden: boolean
}

export type RawLayerPropertiesArtboard = Partial<{
  artboardBackgroundType: number
  Clr: RawColor
  artboardPresentName: string
  artboardRect: RawBounds
}>

export type RawFillOpacity = Partial<{
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

export type RawLayerProperties = Partial<{
  lyid: number | string
  artb: RawLayerPropertiesArtboard
  iOpa: RawFillOpacity
  lfx2: RawlayerEffects
  lfxs: RawlayerEffects
  lmfx: RawlayerEffects
  SoCo: RawFill
  GdFl: RawFill
  vscg: RawFill
  vstk: RawShapeStrokeStyle
  TySh: RawTextProperties
  vmsk: RawVectorMaskSetting
  vsms: RawVectorMaskSetting
  vogk: RawVectorOriginationData
  lsct: RawLayerBlendProps
  lsdk: RawLayerBlendProps
  lnsr: Uint8Array
  // we do not care for props of smart object, just for its existence
  SoLd: Record<string, unknown>
  SoLE: Record<string, unknown>
}>

export type AddedType<T extends SourceLayerType> = { addedType: T }
export type RawNodeChildWithType = (RawParsedLayerGroup | RawParsedLayerLayer) & AddedType<SourceLayerType>
export type RawNodeChildWithProps = RawParsedLayerGroup | RawParsedLayerLayer

export type RawParsedLayerLayer = Partial<Layer> & {
  layerProperties?: RawLayerProperties
}

export type RawParsedLayerGroup = Partial<Exclude<Group, 'children'>> & {
  children: RawNodeChildWithProps[]
  layerProperties?: RawLayerProperties
}
