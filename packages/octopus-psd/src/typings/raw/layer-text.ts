import type { AddedType, ParsedLayerLayer } from './layer'
import type { RawBounds } from './shared'
import type { ParagraphRun } from './style-paragraph'
import type { StyleRun } from './style-text'

export type RawTextEngineDict = {
  Editor: { Text: string }
}
export type RawText = {
  EngineDict: RawTextEngineDict
}

export type RawLayerText = ParsedLayerLayer & AddedType<'textLayer'>

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

export type EngineData = Partial<{
  DocumentResources: Readonly<Record<string, unknown>>
  EngineDict: EngineDataEngineDict
  ResourceDict: EngineDataResourceDict
}>

export type EngineDataResourceDict = Partial<{
  FontSet: EngineDataResourceDictFontSet[]
}>

export type EngineDataResourceDictFontSet = Partial<{
  Synthetic: number
  FontType: number
  Script: number
  Name: string
}>

export type EngineDataEngineDict = Partial<{
  StyleRun: StyleRun
  ParagraphRun: ParagraphRun
}>
