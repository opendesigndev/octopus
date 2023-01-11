/* eslint-disable @typescript-eslint/no-explicit-any */
import max from 'lodash/max'

import { inferPostScriptName } from '../../../utils/text'

import type { StyledTextSegment, TextNode } from '../../../typings/plugin-api'
import type { RawLayer, RawPaint, RawTextStyle } from '../../../typings/raw'

const DEFAULT_TRANSFORM = [
  [1, 0, 0],
  [0, 1, 0],
]

const isArray = Array.isArray
const isNumber = (value?: any): value is number => typeof value === 'number'

export class SourceNormalizer {
  private _raw: any // TODO fix any

  constructor(raw: any) {
    this._raw = raw
  }

  private _normalizeGeometry(geometry: any): any {
    if (geometry && geometry.data && geometry.path === undefined) {
      geometry.path = geometry.data
      delete geometry.data
    }
  }

  private _normalizeChildTransform(layer: any, subTx: number, subTy: number): any {
    const [[a, c, tx], [b, d, ty]] = layer.relativeTransform ?? [[], []]
    if (!isNumber(tx) || !isNumber(ty)) return layer
    layer.relativeTransform = [
      [a, c, tx - subTx],
      [b, d, ty - subTy],
    ]
    if (layer.type === 'GROUP' && isArray(layer.children)) {
      layer.children.forEach((child: unknown) => this._normalizeChildTransform(child, subTx, subTy))
    }
    return layer
  }

  private _normalizeFill(fill: any): any {
    if (!fill.imageRef && fill.imageHash) {
      fill.imageRef = fill.imageHash
      delete fill.imageHash
    }
    if (fill.scaleMode === 'CROP') {
      fill.scaleMode = 'STRETCH'
    }
  }

  private _normalizeSize(raw: any): RawLayer {
    const { size, width, height } = raw
    if (!size && (width || height)) {
      raw.size = { x: width, y: height }
    }
    return raw
  }

  private _normalizeCornerRadius(raw: any): RawLayer {
    const { cornerRadius, rectangleCornerRadii, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius } =
      raw
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
    return raw
  }

  private _normalizeStroke(raw: any): RawLayer {
    const { strokeCap, strokeWeight } = raw

    if (strokeCap === 'Mixed') raw.strokeCap = 'NONE'

    if (strokeWeight === 'Mixed') {
      const { strokeTopWeight, strokeBottomWeight, strokeLeftWeight, strokeRightWeight } = raw
      raw.strokeWeight = max([strokeTopWeight, strokeBottomWeight, strokeLeftWeight, strokeRightWeight, 1])
    }

    return raw
  }

  private _normalizeTextStyle(textNode: TextNode, textStyle: StyledTextSegment): RawTextStyle {
    const { fontName, fontWeight, fontSize, textCase, textDecoration, lineHeight } = textStyle
    const { textAlignHorizontal, textAlignVertical, listSpacing, textAutoResize, paragraphSpacing, paragraphIndent } =
      textNode
    const fontFamily = fontName.family
    const fontStyle = fontName.style
    const italic = fontName.style.includes('Italic')
    const fontPostScriptName = inferPostScriptName({ fontFamily, fontStyle, fontWeight, italic })
    const letterSpacing = textStyle.letterSpacing.value
    const fills = textStyle.fills as RawPaint[]
    const lineHeightPx = lineHeight.unit === 'PIXELS' ? lineHeight.value : undefined
    const lineHeightPercent = lineHeight.unit === 'PERCENT' ? lineHeight.value : undefined
    return {
      fontFamily,
      fontPostScriptName,
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

  private _normalizeText(raw: any): RawLayer {
    const { styledTextSegments } = raw
    if (styledTextSegments?.length > 0) {
      const getNextCharacterStyleOverrides = (value: number, length: number): number[] => Array(length).fill(value)

      // initialize
      const characterStyleOverrides: number[] = []
      const styleOverrideTable: { [key: string]: RawTextStyle | undefined } = {}

      styledTextSegments.forEach((segment: StyledTextSegment, index: number) => {
        const nextCharacterStyleOverrides = getNextCharacterStyleOverrides(index, segment.end - segment.start)
        characterStyleOverrides.push(...nextCharacterStyleOverrides)

        const rawTextStyle = this._normalizeTextStyle(raw, segment)
        if (index === 0) {
          raw.style = rawTextStyle
        } else {
          styleOverrideTable[index] = rawTextStyle
        }
      })

      raw.characterStyleOverrides = characterStyleOverrides
      raw.styleOverrideTable = styleOverrideTable
      delete raw.styledTextSegments
    }
    return raw
  }

  private _normalizeGroup(raw: any): RawLayer {
    const [[_a, _c, tx], [_b, _d, ty]] = raw.relativeTransform
    if (isArray(raw.children) && isNumber(tx) && isNumber(ty)) {
      raw.children.forEach((child: unknown) => this._normalizeChildTransform(child, tx, ty))
    }
    return raw
  }

  private _normalizeLayer(raw: any): RawLayer {
    const { type } = raw

    this._normalizeSize(raw)
    this._normalizeCornerRadius(raw)
    this._normalizeStroke(raw)

    const { fillGeometry, strokeGeometry, fills } = raw
    if (isArray(fillGeometry)) fillGeometry.forEach((geometry) => this._normalizeGeometry(geometry))
    if (isArray(strokeGeometry)) strokeGeometry.forEach((geometry) => this._normalizeGeometry(geometry))
    if (isArray(fills)) fills.forEach((fill) => this._normalizeFill(fill))

    if (type === 'BOOLEAN_OPERATION') raw.relativeTransform = DEFAULT_TRANSFORM
    if (type === 'POLYGON') raw.type = 'REGULAR_POLYGON'
    if (type === 'GROUP') this._normalizeGroup(raw)
    if (type === 'TEXT') this._normalizeText(raw)

    if (isArray(raw.children)) raw.children.forEach((child: unknown) => this._normalizeLayer(child))
    return raw
  }

  public normalize(): RawLayer {
    return this._normalizeLayer(this._raw)
  }
}
