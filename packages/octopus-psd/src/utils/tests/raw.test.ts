/* eslint-disable @typescript-eslint/no-explicit-any */
import { DescriptorValueType } from '@webtoon/psd-ts'

import { parseNodeChild } from '../raw'

describe('src/utils/raw', () => {
  describe('parseNodeChild', () => {
    it('parses childs layer properties', () => {
      const input = {
        type: 'Layer',
        additionalProperties: [
          {
            key: 'somekey ',
            value: 10,
          },
          {
            key: 'descriptorKey',
            descriptor: {
              items: new Map()
                .set('stringKey', { type: DescriptorValueType.String, value: 'abc' })
                .set('descriptorValueKey', {
                  type: DescriptorValueType.GlobalObject,
                  descriptor: {
                    items: new Map()
                      .set('nestedDescriptor1', {
                        type: DescriptorValueType.String,
                        value: 'nested1',
                      })
                      .set('nestedDescriptor2', {
                        type: DescriptorValueType.RawData,
                        data: Buffer.from('RawData'),
                      })
                      .set('nestedDescriptor3', {
                        type: DescriptorValueType.Boolean,
                        value: false,
                      })
                      .set('nestedDescriptor4', { type: DescriptorValueType.GlobalClass, value: 'hello' })
                      .set('nestedDescriptor5', { type: DescriptorValueType.UnitFloats, values: [1, 2, 3] })
                      .set('nestedDescriptor6', {
                        type: DescriptorValueType.List,
                        values: [
                          {
                            type: DescriptorValueType.Alias,
                            data: Buffer.from('Alias'),
                          },
                        ],
                      })
                      .set('nestedDescriptor7', {
                        type: DescriptorValueType.ObjectArray,
                        items: [
                          {
                            key: 'nestedNested1',
                            value: { value: 'nestedNestedValue', type: DescriptorValueType.String },
                          },
                          {
                            key: 'nestedNested2',
                            value: {
                              type: DescriptorValueType.UnitFloat,
                              value: {
                                Hrzn: {
                                  value: 10,
                                  unitType: 'perc',
                                },
                              },
                            },
                          },
                        ],
                      }),
                  },
                }),
            },
          },
        ],
      }

      const expected = {
        ...input,
        parsedProperties: {
          somekey: 10,
          descriptorKey: {
            stringKey: 'abc',
            descriptorValueKey: {
              nestedDescriptor1: 'nested1',
              nestedDescriptor2: 'RawData',
              nestedDescriptor3: false,
              nestedDescriptor4: { type: DescriptorValueType.GlobalClass, value: 'hello' },
              nestedDescriptor5: [1, 2, 3],
              nestedDescriptor6: ['Alias'],
              nestedDescriptor7: {
                nestedNested1: 'nestedNestedValue',
                nestedNested2: {
                  Hrzn: {
                    value: 10,
                    unitType: 'perc',
                  },
                },
              },
            },
          },
        },
      }

      expect(parseNodeChild(input as any).layerProperties).toEqual(expected.parsedProperties)
    })
  })
})
