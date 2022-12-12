import type {
  UnitFloatType,
  Reference,
  Descriptor,
  AdditionalLayerInfo,
  AliKey,
  TypeToolObjectSettingAliBlock,
} from '@opendesign/psd-ts/dist/interfaces/'

export type DescriptorValuePropertyClass = {
  name: string
  classId: string
}

export type DescriptorValueUnitFloats = {
  unitType: UnitFloatType
  values: number[]
}

export type DescriptorValueReference = {
  references: Reference[]
}

export type DescriptorValueEnumerated = {
  enumType: string
  enumValue: string
}

type ExcludedTextData<T> = Omit<T, 'textData'>
type ExcludedWarpData<T> = Omit<T, 'warpData'>

interface ParsedTypeToolObjectSettingAliBlockTextData extends ExcludedTextData<TypeToolObjectSettingAliBlock> {
  textData: DescriptorValueTree
}

export interface ParsedTypeToolObjectSettingAliBlock
  extends ExcludedWarpData<ParsedTypeToolObjectSettingAliBlockTextData> {
  warpData: DescriptorValueTree
}

export type DescriptorValueTreeNode =
  | number
  | number[]
  | boolean
  | string
  | DescriptorValuePropertyClass
  | DescriptorValueUnitFloats
  | DescriptorValueReference
  | DescriptorValueEnumerated
  | AdditionalLayerInfo
  | Uint8Array
  | DescriptorValueTree
  | DescriptorValueTreeNode[]
  | ParsedTypeToolObjectSettingAliBlock

export type DescriptorValueTree = { [key: string]: DescriptorValueTreeNode }
export type AdditionalProperty = (Descriptor & { values: DescriptorValueTree }) | AdditionalLayerInfo
export type AdditionalPropertyTree = { [key in AliKey]: AdditionalProperty }
