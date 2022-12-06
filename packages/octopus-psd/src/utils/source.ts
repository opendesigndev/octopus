import { asFiniteNumber, asNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { AliKey, Layer } from '@webtoon/psd'
import intersection from 'lodash/intersection.js'

import { PSDFileReader } from '../services/readers/psd-file-reader.js'

import type {
  RawMatrix,
  RawPointXY,
  RawRadiiCorners,
  NodeChildWithType,
  RawColor,
  RawBounds,
  NodeChildWithProps,
} from '../typings/raw'
import type { SourceBounds, SourceColor, SourceMatrix, SourcePointXY, SourceRadiiCorners } from '../typings/source.js'
import type { AdditionalLayerInfo, NodeChild } from '@webtoon/psd'
import type { AdditionalLayerProperties } from '@webtoon/psd/dist/sections'

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

export function getLayerTypeKey(additionalLayerProperties: AdditionalLayerProperties | undefined): string | undefined {
  const layerTypeProp = getAdditionalProperty(AliKey.LayerNameSourceSetting, additionalLayerProperties)
  if (!layerTypeProp || !('data' in layerTypeProp)) {
    return
  }

  const { data } = layerTypeProp

  if (!ArrayBuffer.isView(data)) {
    return
  }

  return Buffer.from(data).toString()
}

export function isShapeLayer(additionalProperties: AdditionalLayerProperties | undefined): boolean {
  if (!additionalProperties) {
    return false
  }

  const vectorMaskSettingK = additionalProperties[AliKey.VectorMaskSetting1]

  const validVectorMaskSetting = vectorMaskSettingK
    ? vectorMaskSettingK
    : additionalProperties[AliKey.VectorMaskSetting2]

  if (
    !validVectorMaskSetting ||
    ('disable' in validVectorMaskSetting && validVectorMaskSetting.disable === true) ||
    !validVectorMaskSetting.pathRecords
  ) {
    return false
  }

  return Boolean(intersection(Object.keys(additionalProperties), PSDFileReader.SHAPE_LAYER_KEYS).length)
}

export function isAdjustmentLayer(additionalProperties: AdditionalLayerProperties | undefined): boolean {
  if (!additionalProperties) {
    return false
  }

  return Boolean(intersection(PSDFileReader.ADJUSTMENT_LAYER_KEYS, Object.keys(additionalProperties)).length)
}

export function getColor(rawColor: RawColor | undefined): null | SourceColor {
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

export function getLayerBounds(layer: NodeChildWithType | NodeChildWithProps): SourceBounds {
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
