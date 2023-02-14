import type {
  UnitFloatType,
  Reference,
  AdditionalLayerInfo,
  TypeToolObjectSettingAliBlock,
} from '@webtoon/psd-ts/dist/interfaces/'

export type RawDescriptorValueUnitFloats = Partial<{
  unitType: UnitFloatType
  values: number[]
}>

export type RawDescriptorValueReference = Partial<{
  references: Reference[]
}>

export type RawDescriptorValueEnumerated = Partial<{
  enumType: string
  enumValue: string
}>

type RawExcludedTextData<T> = Omit<T, 'textData'>
type RawExcludedWarpData<T> = Omit<T, 'warpData'>

interface RawParsedTypeToolObjectSettingAliBlockTextData extends RawExcludedTextData<TypeToolObjectSettingAliBlock> {
  textData?: RawDescriptorValueTree
}

export interface RawParsedTypeToolObjectSettingAliBlock
  extends RawExcludedWarpData<RawParsedTypeToolObjectSettingAliBlockTextData> {
  warpData?: RawDescriptorValueTree
}

export type RawDescriptorValueTreeNode =
  | number
  | number[]
  | boolean
  | string
  | RawDescriptorValueUnitFloats
  | RawDescriptorValueReference
  | RawDescriptorValueEnumerated
  | AdditionalLayerInfo
  | Uint8Array
  | RawDescriptorValueTree
  | RawDescriptorValueTreeNode[]
  | RawParsedTypeToolObjectSettingAliBlock

export type RawDescriptorValueTree = { [key: string]: RawDescriptorValueTreeNode }
