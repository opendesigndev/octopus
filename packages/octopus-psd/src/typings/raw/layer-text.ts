import type { AddedType, RawParsedLayerLayer } from './layer.js'
import type { RawBounds } from './shared.js'
import type { RawParagraphRun } from './style-paragraph.js'
import type { RawStyleRun, RawStyleSheetData } from './style-text.js'

export type RawTextEngineDict = {
  Editor: { Text: string }
}
export type RawText = {
  EngineDict: RawTextEngineDict
}

export type RawLayerText = RawParsedLayerLayer & AddedType<'textLayer'>

export type RawTextPropertiesTextData = Partial<{
  Txt: string
  textGridding: string
  Ornt: string
  AntA: string
  bounds: RawBounds
  boundingBox: RawBounds
  TextIndex: number
  EngineData: string
  warpVersion: number
}>

export type RawTextPropertiesWarpData = Partial<{
  warpStyle: string
  warpValue: number
  warpPerspective: number
  warpPerspectiveOther: number
  warpRotate: string
}>

export type RawTextProperties = Partial<{
  signature: string
  key: string
  version: number
  transformXX: number
  transformXY: number
  transformYX: number
  transformYY: number
  transformTX: number
  transformTY: number
  textVersion: number
  textData: RawTextPropertiesTextData
  warpVersion: number
  warpData: RawTextPropertiesWarpData
  left: number
  top: number
  right: number
  bottom: number
}>

export type RawEngineData = Partial<{
  DocumentResources: Readonly<Record<string, unknown>>
  EngineDict: RawEngineDataEngineDict
  ResourceDict: RawEngineDataResourceDict
}>

export type RawEngineDataResourceDict = Partial<{
  FontSet: RawEngineDataResourceDictFontSet[]
  TheNormalStyleSheet: number
  StyleSheetSet: {
    Name: string
    StyleSheetData: RawStyleSheetData
  }[]
}>

export type RawEngineDataResourceDictFontSet = Partial<{
  Synthetic: number
  FontType: number
  Script: number
  Name: string
}>

export type RawEngineDataEngineDict = Partial<{
  StyleRun: RawStyleRun
  ParagraphRun: RawParagraphRun
}>
