/* eslint-disable @typescript-eslint/no-explicit-any */
import isArray from 'lodash/isArray'
import isNumber from 'lodash/isNumber'

import type { StyledTextSegment, TextNode } from '../../../figma-plugin-api'
import type { SourceAssets } from '../../../typings/pluginSource'
import type { RawLayer, RawPaint, RawTextStyle } from '../../../typings/raw'

function fixGeometry(geometry: any): any {
  if (geometry && geometry.data && geometry.path === undefined) {
    geometry.path = geometry.data
    delete geometry.data
  }
}

function fixChildTransform(layer: any, subTx: number, subTy: number): any {
  const [[a, c, tx], [b, d, ty]] = layer.relativeTransform ?? [[], []]
  if (!isNumber(tx) || !isNumber(ty)) return layer
  layer.relativeTransform = [
    [a, c, tx - subTx],
    [b, d, ty - subTy],
  ]
  if (isArray(layer.children)) {
    layer.children.forEach((child: unknown) => fixChildTransform(child, subTx, subTy))
  }
  return layer
}

function fixFill(fill: any): any {
  if (!fill.imageRef && fill.imageHash) {
    fill.imageRef = fill.imageHash
    delete fill.imageHash
  }
  if (fill.scaleMode === 'CROP') {
    fill.scaleMode = 'STRETCH'
  }
}

function fixTextStyle(textNode: TextNode, textStyle: StyledTextSegment): RawTextStyle {
  const { fontName, fontWeight, fontSize, textCase, textDecoration, lineHeight } = textStyle
  const { textAlignHorizontal, textAlignVertical, listSpacing, textAutoResize, paragraphSpacing, paragraphIndent } =
    textNode
  const fontFamily = fontName.family
  const italic = fontName.style.includes('Italic')
  const letterSpacing = textStyle.letterSpacing.value
  const fills = textStyle.fills as RawPaint[]
  const lineHeightPx = lineHeight.unit === 'PIXELS' ? lineHeight.value : undefined
  const lineHeightPercent = lineHeight.unit === 'PERCENT' ? lineHeight.value : undefined
  return {
    fontFamily,
    fontWeight,
    fontSize,
    textAlignHorizontal,
    textAlignVertical,
    letterSpacing,
    italic,
    textCase,
    textDecoration,
    listSpacing,
    textAutoResize,
    paragraphSpacing,
    paragraphIndent,
    lineHeightPx,
    lineHeightPercent,
    fills,
  }
}

export function convert(raw: any, assets: SourceAssets = {}): RawLayer {
  const { id, type } = raw

  // missing Size fix
  const { size, width, height } = raw
  if (!size && (width || height)) {
    raw.size = { x: width, y: height }
  }

  // missing Geometry Path fix
  const { fillGeometry, strokeGeometry } = raw
  if (isArray(fillGeometry)) fillGeometry.forEach(fixGeometry)
  if (isArray(strokeGeometry)) strokeGeometry.forEach(fixGeometry)

  // FILLS fix
  const { fills } = raw
  if (isArray(fills)) fills.forEach(fixFill)

  // CornerRadii fix
  const { cornerRadius, rectangleCornerRadii, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius } = raw
  if (cornerRadius === 'Mixed') {
    if (!rectangleCornerRadii) {
      raw.rectangleCornerRadii = [
        topLeftRadius ?? 0,
        topRightRadius ?? 0,
        bottomLeftRadius ?? 0,
        bottomRightRadius ?? 0,
      ]
      delete raw.topLeftRadius
      delete raw.topRightRadius
      delete raw.bottomLeftRadius
      delete raw.bottomRightRadius
    }
    delete raw.cornerRadius
  }

  // strokeCap Mixed fix
  const { strokeCap } = raw
  if (strokeCap === 'Mixed') {
    raw.strokeCap = 'NONE'
  }

  // shape type Polygon fix
  if (type === 'POLYGON') {
    raw.type = 'REGULAR_POLYGON'
  }

  // BOOLEAN_OPERATION transform fix
  if (type === 'BOOLEAN_OPERATION') {
    raw.relativeTransform = [
      [1, 0, 0],
      [0, 1, 0],
    ]
  }

  // GROUP transform fix
  if (type === 'GROUP') {
    const [[_a, _c, tx], [_b, _d, ty]] = raw.relativeTransform
    if (isArray(raw.children) && isNumber(tx) && isNumber(ty)) {
      raw.children.forEach((child: unknown) => fixChildTransform(child, tx, ty))
    }
  }

  // TEXT transform fix
  if (type === 'TEXT' && id) {
    const styles = assets.styledTextSegments?.[id] ?? []
    if (styles.length > 0) {
      raw.style = fixTextStyle(raw, styles[0])
    }

    // TODO HERE HERE
  }

  if (isArray(raw.children)) raw.children.forEach((child: unknown) => convert(child, assets))
  return raw
}
