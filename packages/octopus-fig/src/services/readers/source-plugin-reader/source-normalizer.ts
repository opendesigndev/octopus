/* eslint-disable @typescript-eslint/no-explicit-any */
import max from 'lodash/max.js'

import { convertToRawTransform } from './utils.js'
import { createMatrix } from '../../../utils/paper.js'
import { getTransformFor } from '../../../utils/source.js'

import type { StyledTextSegment, TextNode } from '../../../typings/plugin-api.js'
import type { RawLayer, RawPaint, RawTextStyle, RawTransform } from '../../../typings/raw/index.js'

const DEFAULT_TRANSFORM = [
  [1, 0, 0],
  [0, 1, 0],
]

const isArray = Array.isArray

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

  private _normalizeChildTransform(layer: any, parentTransform: RawTransform): any {
    const relativeTransform = getTransformFor(layer.relativeTransform)
    const parentSourceTransform = getTransformFor(parentTransform)
    if (!relativeTransform || !parentSourceTransform) return layer

    const resultTransform = createMatrix(parentSourceTransform).invert().append(createMatrix(relativeTransform)).values
    layer.relativeTransform = convertToRawTransform(resultTransform)

    if (layer.type === 'GROUP' && isArray(layer.children)) {
      layer.children.forEach((child: unknown) => this._normalizeChildTransform(child, parentTransform))
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
    if (fill.type === 'IMAGE' && fill.scaleMode === 'FILL') {
      fill.imageTransform = undefined // Image with FILL scale mode don't need imageTransform and the one that we receive from plugin api is not correct
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
    if (!cornerRadius) {
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
    }
    return raw
  }

  private _normalizeStroke(raw: any): RawLayer {
    const { strokeCap, strokeWeight } = raw

    if (!strokeCap) raw.strokeCap = 'NONE'

    if (!strokeWeight) {
      const { strokeTopWeight, strokeBottomWeight, strokeLeftWeight, strokeRightWeight } = raw
      raw.strokeWeight = max([strokeTopWeight, strokeBottomWeight, strokeLeftWeight, strokeRightWeight, 1])
    }

    return raw
  }

  private _normalizeTextStyle(textNode: TextNode, textStyle: StyledTextSegment): RawTextStyle {
    const { fontName, fontWeight, fontSize, textCase, textDecoration, lineHeight } = textStyle
    const { textAlignHorizontal, textAlignVertical, listSpacing, textAutoResize, paragraphSpacing, paragraphIndent } =
      textNode
    const { family: fontFamily, style: fontStyle } = fontName
    const italic = fontName.style.includes('Italic')
    const letterSpacing = textStyle.letterSpacing.value
    const fills = textStyle.fills as RawPaint[]
    const lineHeightPx = lineHeight.unit === 'PIXELS' ? lineHeight.value : undefined
    const lineHeightPercent = lineHeight.unit === 'PERCENT' ? lineHeight.value : undefined
    return {
      fontFamily,
      fontStyle,
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

  private _getNextCharacterStyleOverrides(value: number, length: number): number[] {
    return Array(length).fill(value)
  }

  private _normalizeText(raw: any): RawLayer {
    const { styledTextSegments } = raw
    if (styledTextSegments?.length > 0) {
      // initialize
      const characterStyleOverrides: number[] = []
      const styleOverrideTable: { [key: string]: RawTextStyle | undefined } = {}

      styledTextSegments.forEach((segment: StyledTextSegment, index: number) => {
        const nextCharacterStyleOverrides = this._getNextCharacterStyleOverrides(index, segment.end - segment.start)
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
    if (isArray(raw.children) && isArray(raw.relativeTransform)) {
      raw.children.forEach((child: unknown) => this._normalizeChildTransform(child, raw.relativeTransform))
    }
    return raw
  }

  private _normalizeTopLayerTransform(raw: any): RawLayer {
    const transform = raw.type === 'BOOLEAN_OPERATION' ? DEFAULT_TRANSFORM : raw.absoluteTransform
    const [[a, c, tx], [b, d, ty]] = transform
    const { x, y } = raw.absoluteRenderBounds
    raw.relativeTransform = [
      [a, c, tx - x],
      [b, d, ty - y],
    ]
    return raw
  }

  private _normalizeLayer(raw: any, isTopLayer = false): RawLayer {
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
    if (isTopLayer) this._normalizeTopLayerTransform(raw)

    if (isArray(raw.children)) raw.children.forEach((child: unknown) => this._normalizeLayer(child))
    return raw
  }

  public normalize(): RawLayer {
    const IS_TOP_LAYER = true
    return this._normalizeLayer(this._raw, IS_TOP_LAYER)
  }
}
