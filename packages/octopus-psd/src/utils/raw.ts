import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'
import { DescriptorValueType, AliKey } from '@opendesign/psd-ts'

import { DEFAULTS } from './defaults.js'

import type { DescriptorValueTreeNode, DescriptorValueTree, NodeChildWithProps, ParsedPsd } from '../typings/raw'
import type Psd from '@opendesign/psd-ts'
import type { NodeChild, AdditionalLayerInfo } from '@opendesign/psd-ts'
import type {
  AliasDescriptorValue,
  DescriptorDescriptorValue,
  DescriptorValue,
  DoubleDescriptorValue,
  IntegerDescriptorValue,
  LargeIntegerDescriptorValue,
  RawDataDescriptorValue,
  ObjectArrayDescriptorValue,
  ListDescriptorValue,
  UnitFloatDescriptorValue,
} from '@opendesign/psd-ts/dist/interfaces/'

export function parseDescriptorItems(items?: Map<string, DescriptorValue>): DescriptorValueTree {
  if (!items) {
    return {}
  }

  const keys = Array.from(items.keys())
  const intemsEntries = keys
    .map((key): [string, DescriptorValueTreeNode] | undefined => {
      const descriptorValue = items.get(key)

      if (typeof descriptorValue === 'undefined') {
        return
      }

      const value = parseDescriptorValue(descriptorValue, key)

      if (typeof value === 'undefined') {
        return
      }

      return [key, value]
    })
    .filter((valueEntry): valueEntry is [string, DescriptorValueTreeNode] => {
      if (!valueEntry) {
        return false
      }

      return typeof valueEntry[1] !== 'undefined'
    })
    .map(([key, value]) => {
      return [key.trim(), value]
    })
  return Object.fromEntries(intemsEntries)
}

function parseUnitTypeDescriptor(descriptor: UnitFloatDescriptorValue, key: string) {
  if (DEFAULTS.READER.KEYS_WITH_AMBIGUOUS_VALUES.includes(key)) {
    return { ...descriptor }
  }

  return descriptor.value
}

export function parseDescriptorValue(descriptorValue: DescriptorValue, key: string): DescriptorValueTreeNode {
  switch (descriptorValue.type) {
    case DescriptorValueType.String:
      return descriptorValue.value.trim()

    case DescriptorValueType.GlobalObject:
    case DescriptorValueType.Descriptor:
      return parseDescriptorDescriptorValue(descriptorValue)

    case DescriptorValueType.Alias:
    case DescriptorValueType.RawData:
      return parseUint8DescriptorValue(descriptorValue)

    case DescriptorValueType.Boolean:
      return descriptorValue.value

    case DescriptorValueType.GlobalClass:
    case DescriptorValueType.Class:
      return { ...descriptorValue }

    case DescriptorValueType.Integer:
    case DescriptorValueType.Double:
    case DescriptorValueType.LargeInteger:
      return descriptorValue.value

    case DescriptorValueType.UnitFloat:
      return parseUnitTypeDescriptor(descriptorValue, key)

    case DescriptorValueType.UnitFloats:
      return descriptorValue.values

    case DescriptorValueType.Reference:
      return { ...descriptorValue }

    case DescriptorValueType.Enumerated:
      return descriptorValue.enumValue.trim()

    case DescriptorValueType.List:
      return parseListDescriptorValue(descriptorValue, key)
    case DescriptorValueType.ObjectArray:
      return parseObjectArrayDescriptorValue(descriptorValue)
  }
}

export function parseListDescriptorValue(
  listDescriptorValue: ListDescriptorValue,
  key: string
): DescriptorValueTreeNode {
  const values = listDescriptorValue.values.map((item) => {
    return parseDescriptorValue(item, `${key}/list`)
  })
  return values
}

export function parseUint8DescriptorValue(uintDescriptor: AliasDescriptorValue | RawDataDescriptorValue): string {
  return Buffer.from(uintDescriptor.data).toString()
}
export function parseDescriptorDescriptorValue(objc: DescriptorDescriptorValue): DescriptorValueTree {
  return parseDescriptorItems(objc.descriptor.items)
}

export function parseObjectArrayDescriptorValue(
  objectArrayDescriptorValue: ObjectArrayDescriptorValue
): DescriptorValueTree {
  return objectArrayDescriptorValue.items.reduce((tree, item) => {
    const key = item.key.trim()
    return { ...tree, [key]: parseDescriptorValue(item.value, key) }
  }, {})
}

type NumberDescriptor = IntegerDescriptorValue | LargeIntegerDescriptorValue | DoubleDescriptorValue

export function parseNumberDescriptor(numberDescritor: NumberDescriptor): number {
  return numberDescritor.value
}

export function extractValueFromAdditionalProperty(additionalLayerInfo: AdditionalLayerInfo): number | undefined {
  return 'value' in additionalLayerInfo ? additionalLayerInfo.value : undefined
}

export function parseAdditionalProperty(additionalProperty: AdditionalLayerInfo): DescriptorValueTree {
  const { key } = additionalProperty
  const trimmedKey = key.trim()

  if ('value' in additionalProperty) {
    const { value } = additionalProperty
    return { [trimmedKey]: value }
  }

  if ('descriptor' in additionalProperty) {
    const val = { [trimmedKey]: parseDescriptorItems(additionalProperty.descriptor.items) }

    return val
  }

  if ('data' in additionalProperty && 'items' in additionalProperty.data) {
    return { [trimmedKey]: parseDescriptorItems(additionalProperty.data.items) }
  }

  if ('data' in additionalProperty && 'descriptor' in additionalProperty.data) {
    return { [trimmedKey]: parseDescriptorItems(additionalProperty.data.descriptor.items) }
  }

  if ('data' in additionalProperty) {
    const { data } = additionalProperty

    if (ArrayBuffer.isView(data)) {
      return { [trimmedKey]: data }
    }
  }

  if (key === AliKey.TypeToolObjectSetting && 'textData' in additionalProperty) {
    return {
      [key]: {
        ...additionalProperty,
        textData: parseDescriptorItems(additionalProperty.textData.descriptor.items),
        warpData: parseDescriptorItems(additionalProperty.warpData.descriptor.items),
      },
    }
  }

  return { [key]: additionalProperty }
}

export function parseNodeChild(nodeChild: NodeChild): NodeChildWithProps {
  return Object.create(nodeChild, {
    parsedProperties: {
      value: Object.values(nodeChild.additionalProperties ?? {}).reduce<DescriptorValueTree>(
        (properties, additionalProperty: AdditionalLayerInfo) => {
          return { ...properties, ...parseAdditionalProperty(additionalProperty) }
        },
        {}
      ),
    },

    ...(nodeChild.type === 'Group'
      ? {
          children: { value: nodeChild.children.map(parseNodeChild) },
        }
      : {}),
  })
}

export function getRawData(psd: Psd): ParsedPsd {
  return Object.create(psd, {
    children: {
      value: asArray(psd.children).map(parseNodeChild),
    },
  })
}
