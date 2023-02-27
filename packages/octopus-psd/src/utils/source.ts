import { asFiniteNumber, asNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { AliKey } from '@webtoon/psd-ts'
import intersection from 'lodash/intersection.js'

import { PSDFileReader } from '../services/readers/psd-file-reader.js'
import PROPS from './prop-names.js'

import type {
  RawMatrix,
  RawPointXY,
  RawRadiiCorners,
  RawNodeChildWithType,
  RawColor,
  RawBounds,
  RawNodeChildWithProps,
  RawLayerProperties,
} from '../typings/raw/index.js'
import type { SourceBounds, SourceColor, SourceMatrix, SourcePointXY, SourceRadiiCorners } from '../typings/source.js'
import type { AdditionalLayerInfo, NodeChild, Layer } from '@webtoon/psd-ts'
import type { AdditionalLayerProperties } from '@webtoon/psd-ts/dist/sections'

export function isArtboard(raw: NodeChild) {
  return Boolean(raw?.additionalProperties?.[AliKey.ArtboardData])
}

export function getArtboardColor(
  artboardBackgroundType: number | undefined,
  rawColor: RawColor | undefined
): SourceColor | null {
  switch (artboardBackgroundType) {
    case 1: // white
      return { b: 255, g: 255, r: 255 }
    case 2: // black
      return { b: 0, g: 0, r: 0 }
    case 3: // transparent
      return null
    case 4: // other
      return getColor(rawColor)
  }
  return null
}

export function getRadiiCornersFor(value: RawRadiiCorners | undefined): SourceRadiiCorners {
  return {
    topLeft: asFiniteNumber(value?.topLeft, 0),
    topRight: asFiniteNumber(value?.topRight, 0),
    bottomRight: asFiniteNumber(value?.bottomRight, 0),
    bottomLeft: asFiniteNumber(value?.bottomLeft, 0),
  }
}

export function getMatrixFor(value: RawMatrix | undefined): SourceMatrix {
  return {
    xx: asFiniteNumber(value?.xx, 0),
    xy: asFiniteNumber(value?.xy, 0),
    yx: asFiniteNumber(value?.yx, 0),
    yy: asFiniteNumber(value?.yy, 0),
    tx: asFiniteNumber(value?.tx, 0),
    ty: asFiniteNumber(value?.ty, 0),
  }
}

export function getPointFor(point: RawPointXY | undefined): SourcePointXY {
  const x = asFiniteNumber(point?.x, 0)
  const y = asFiniteNumber(point?.y, 0)
  return { x, y }
}

export function getUnitRatioFor(percentage: number | undefined, defaultValue = 100): number {
  return asFiniteNumber(percentage, defaultValue) / 100
}

export function getAdditionalProperty(
  aliKey: AliKey,
  additionalProperties: AdditionalLayerProperties | undefined
): AdditionalLayerInfo | undefined {
  if (!additionalProperties) {
    return
  }

  return additionalProperties[aliKey]
}

export function getLayerTypeKey(layerProperties: RawLayerProperties | undefined): string | undefined {
  const layerTypeProp = layerProperties?.[PROPS.LAYER_NAME_SOURCE_SETTING]

  if (!layerTypeProp) {
    return
  }

  return Buffer.from(layerTypeProp).toString()
}

export function isShapeLayer(layerProperties: RawLayerProperties | undefined): boolean {
  if (!layerProperties) {
    return false
  }
  const vectorMaskSetting1 = layerProperties[AliKey.VectorMaskSetting1]

  const validVectorMaskSetting = vectorMaskSetting1 ? vectorMaskSetting1 : layerProperties[AliKey.VectorMaskSetting2]

  if (
    !validVectorMaskSetting ||
    ('disable' in validVectorMaskSetting && validVectorMaskSetting.disable === true) ||
    !validVectorMaskSetting.pathRecords
  ) {
    return false
  }

  return Boolean(intersection(Object.keys(layerProperties), PSDFileReader.SHAPE_LAYER_KEYS).length)
}

export function isAdjustmentLayer(layerProperties: RawLayerProperties | undefined): boolean {
  if (!layerProperties) {
    return false
  }

  return Boolean(intersection(PSDFileReader.ADJUSTMENT_LAYER_KEYS, Object.keys(layerProperties)).length)
}

export function getColor(rawColor: RawColor | undefined): null | SourceColor {
  const { Rd, Grn, Bl } = rawColor ?? {}
  if (Bl === undefined && Grn === undefined && Rd === undefined) return null
  return rawColor ? { r: asNumber(rawColor.Rd, 0), g: asNumber(rawColor.Grn, 0), b: asNumber(rawColor.Bl, 0) } : null
}

export function getBoundsFor(rawArtboardBounds: RawBounds | undefined): SourceBounds {
  const top = asNumber(rawArtboardBounds?.Top, 0)
  const left = asNumber(rawArtboardBounds?.Left, 0)
  const bottom = asNumber(rawArtboardBounds?.Btom, 0)
  const right = asNumber(rawArtboardBounds?.Rght, 0)

  const width = right - left
  const height = bottom - top

  return { right, left, bottom, top, width, height }
}

export function getLayerBounds(layer: RawNodeChildWithType | RawNodeChildWithProps): SourceBounds {
  if (layer.type === 'Group') {
    return getBoundsFor({})
  }

  const layerLayer = layer as Layer

  const { top: Top, height, left: Left, width } = layerLayer

  return getBoundsFor({
    Top,
    Left,
    Btom: asNumber(Top, 0) + asNumber(height, 0),
    Rght: asNumber(width, 0) + asNumber(Left, 0),
  })
}
