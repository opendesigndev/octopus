import type {
  UnitFloatType,
  Reference,
  AdditionalLayerInfo,
  TypeToolObjectSettingAliBlock,
} from '@opendesign/psd-ts/dist/interfaces/'

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
  | DescriptorValueUnitFloats
  | DescriptorValueReference
  | DescriptorValueEnumerated
  | AdditionalLayerInfo
  | Uint8Array
  | DescriptorValueTree
  | DescriptorValueTreeNode[]
  | ParsedTypeToolObjectSettingAliBlock

export type DescriptorValueTree = { [key: string]: DescriptorValueTreeNode }
