/* eslint-disable @typescript-eslint/no-explicit-any */
import { AliKey } from '@opendesign/psd-ts'

import { getRawLayerWithType } from '../create-source-layer'

describe('src/factories/create-source-layer.ts', () => {
  describe(getRawLayerWithType.name, () => {
    it('returns backgroundLayer when typeKey is bgnd', () => {
      const layer = getRawLayerWithType({
        layerProperties: {
          [AliKey.LayerNameSourceSetting]: Buffer.from('bgnd'),
        },
      } as any)

      expect(layer.addedType).toEqual('backgroundLayer')
    })

    it('returns layerSection when layer type is Group', () => {
      const layer = getRawLayerWithType({
        type: 'Group',
      } as any)

      expect(layer.addedType).toEqual('layerSection')
    })

    it('returns textLayer when layer is of type Layer and text field is not undefined', () => {
      const layer = getRawLayerWithType({
        type: 'Layer',
        text: '',
      } as any)

      expect(layer.addedType).toEqual('textLayer')
    })

    it('returns shapeLayer when there is vmsk and there is one of PSDFileReader.SHAPE_LAYER_KEYS', () => {
      const layer = getRawLayerWithType({
        type: 'Layer',
        layerProperties: {
          vmsk: {
            pathRecords: [],
          },
          [AliKey.VectorStrokeData]: {},
        },
      } as any)

      expect(layer.addedType).toEqual('shapeLayer')
    })

    it('returns shapeLayer when there is vsms or vsmk and there is one of PSDFileReader.SHAPE_LAYER_KEYS', () => {
      const layer = getRawLayerWithType({
        type: 'Layer',
        layerProperties: {
          vsms: {
            pathRecords: [],
          },
          [AliKey.PatternFillSetting]: {},
        },
      } as any)

      expect(layer.addedType).toEqual('shapeLayer')
    })

    it('does not return shapeLayer when there is vsms or vmsk and there is one of PSDFileReader.SHAPE_LAYER_KEYS but vsms is disable', () => {
      const layer = getRawLayerWithType({
        type: 'Layer',
        layerProperties: {
          vsms: {
            pathRecords: [],
            disable: true,
          },
          [AliKey.PatternFillSetting]: {},
        },
      } as any)

      expect(layer.addedType).toEqual('adjustmentLayer')
    })

    it('returns adjustmentLayer when one of the keys is in PSDFileReader.ADJUSTMENT_LAYER_KEYS', () => {
      const layer = getRawLayerWithType({
        type: 'Layer',
        layerProperties: {
          [AliKey.SolidColorSheetSetting]: {},
        },
      })

      expect(layer.addedType).toEqual('adjustmentLayer')
    })
  })
})
