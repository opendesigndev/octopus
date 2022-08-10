import { firstCallMemo } from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { normalizeText } from '@avocode/octopus-common/dist/postprocessors/text'
import { getMapped, push } from '@avocode/octopus-common/dist/utils/common'

import { logWarn } from '../../services/instances/misc.js'
import { DEFAULTS } from '../../utils/defaults.js'
import { notZero } from '../../utils/misc.js'
import { inferPostScriptName } from '../../utils/text.js'
import { OctopusFill } from './octopus-fill.js'
import { OctopusLayerBase } from './octopus-layer-base.js'
import { OctopusStroke } from './octopus-stroke.js'

import type { Octopus } from '../../typings/octopus.js'
import type { SourceLayerText } from '../source/source-layer-text.js'
import type { SourcePaint } from '../source/source-paint.js'
import type { SourceTextStyle } from '../source/source-text-style.js'
import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base.js'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerText
}

export class OctopusLayerText extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerText

  static HORIZONTAL_ALIGN_MAP = {
    LEFT: 'LEFT',
    CENTER: 'CENTER',
    RIGHT: 'RIGHT',
    JUSTIFIED: 'JUSTIFY',
  } as const

  static TEXT_CASE_MAP = {
    ORIGINAL: 'NONE',
    UPPER: 'UPPERCASE',
    LOWER: 'LOWERCASE',
    SMALL_CAPS: 'SMALL_CAPS',
    SMALL_CAPS_FORCED: 'SMALL_CAPS',
    TITLE: 'TITLE_CASE',
  } as const

  static FRAME_MODE_MAP = {
    NONE: 'FIXED',
    HEIGHT: 'AUTO_HEIGHT',
    WIDTH_AND_HEIGHT: 'AUTO_WIDTH',
  } as const

  constructor(options: OctopusLayerTextOptions) {
    super(options)
  }

  get sourceLayer(): SourceLayerText {
    return this._sourceLayer
  }

  private _getFills(fills: SourcePaint[]): Octopus['Fill'][] {
    return fills.reduce((fills: Octopus['Fill'][], fill: SourcePaint) => {
      const newFill = new OctopusFill({ fill, parentLayer: this.sourceLayer }).convert()
      return newFill ? push(fills, newFill) : fills
    }, [])
  }

  private get _fills(): Octopus['Fill'][] {
    return this._getFills(this.sourceLayer.fills)
  }

  private get _strokes(): Octopus['VectorStroke'][] {
    return this.sourceLayer.strokes.reduce((strokes: Octopus['VectorStroke'][], fill: SourcePaint) => {
      const stroke = new OctopusStroke({ fill, sourceLayer: this.sourceLayer }).convert()
      return stroke ? push(strokes, stroke) : strokes
    }, [])
  }

  private _parsePostScriptName(textStyle: SourceTextStyle): string | null {
    const originalPostScriptName = textStyle.fontPostScriptName
    if (originalPostScriptName) return originalPostScriptName
    const fontFamily = textStyle.fontFamily
    const weight = textStyle.fontWeight
    const italic = textStyle.italic
    return inferPostScriptName({ fontFamily, weight, italic })
  }

  private _getFont(textStyle: SourceTextStyle): Octopus['TextStyle']['font'] | null {
    const postScriptName = this._parsePostScriptName(textStyle)
    if (!postScriptName) {
      logWarn('Unknown font postScriptName', { textStyle })
      return null
    }
    return { postScriptName, family: textStyle.fontFamily }
  }

  private _getLineHeight(textStyle: SourceTextStyle): number | undefined {
    const lhPx = textStyle.lineHeightPx
    const lhPercent = textStyle.lineHeightPercent
    if (lhPx === undefined && lhPercent === undefined) return undefined
    return lhPercent === 100 ? 0 : notZero(lhPx ?? 0)
  }

  private _getStyle(textStyle: SourceTextStyle): Octopus['TextStyle'] | null {
    const font = this._getFont(textStyle)
    if (!font) return null

    const fontSize = textStyle.fontSize
    const lineHeight = this._getLineHeight(textStyle)
    const kerning = textStyle.kerning
    const letterSpacing = textStyle.letterSpacing

    const letterCase = getMapped(textStyle.textCase, OctopusLayerText.TEXT_CASE_MAP, undefined)

    const textDecoration = textStyle.textDecoration
    const underline = textDecoration === undefined ? undefined : textDecoration === 'UNDERLINE' ? 'SINGLE' : 'NONE'
    const linethrough = textDecoration === undefined ? undefined : textDecoration === 'STRIKETHROUGH'

    const fills = textStyle.textFills && this._getFills(textStyle.textFills)

    return { font, fontSize, lineHeight, kerning, letterSpacing, underline, linethrough, letterCase, fills }
  }

  @firstCallMemo()
  private get _defaultStyle(): Octopus['TextStyle'] | null {
    const textStyle = this.sourceLayer.defaultStyle
    if (!textStyle) return null
    const font = this._getFont(textStyle)
    if (!font) return null

    const fontSize = textStyle.fontSize ?? DEFAULTS.TEXT.FONT_SIZE
    const lineHeight = this._getLineHeight(textStyle)
    const kerning = textStyle.kerning === false ? false : undefined
    const letterSpacing = textStyle.letterSpacing

    const letterCase = getMapped(textStyle.textCase, OctopusLayerText.TEXT_CASE_MAP, undefined)

    const textDecoration = textStyle.textDecoration
    const underline = textDecoration === 'UNDERLINE' ? 'SINGLE' : undefined
    const linethrough = textDecoration === 'STRIKETHROUGH' ? true : undefined

    const fills = textStyle.textFills?.length ? this._getFills(textStyle.textFills) : this._fills
    const strokes = this._strokes

    return { font, fontSize, lineHeight, kerning, letterSpacing, underline, linethrough, letterCase, fills, strokes }
  }

  @firstCallMemo()
  private get _styles(): Octopus['StyleRange'][] {
    const overrideMap = this.sourceLayer.characterStyleOverrides.reduce((overrideMap, key, index) => {
      const arr = overrideMap[key]
      if (arr) {
        arr.push(index)
      } else {
        overrideMap[key] = [index]
      }
      return overrideMap
    }, {} as { [key: string]: number[] | undefined })

    const overrideTable = this.sourceLayer.styleOverrideTable

    return Object.keys(overrideMap).reduce((styleRanges, key) => {
      const sourceStyle = overrideTable[key]
      if (!sourceStyle) return styleRanges

      const style = this._getStyle(sourceStyle)
      if (!style) return styleRanges

      const positions = overrideMap[key]
      if (!positions) return styleRanges
      const ranges = positions.map((from) => ({ from, to: from + 1 }))

      return push(styleRanges, { style, ranges })
    }, [])
  }

  get horizontalAlign(): Octopus['Text']['horizontalAlign'] {
    const horizontalAlign = this.sourceLayer.defaultStyle?.textAlignHorizontal
    const result = getMapped(horizontalAlign, OctopusLayerText.HORIZONTAL_ALIGN_MAP, undefined)
    if (!result) {
      logWarn('Unknown Stroke Cap', { horizontalAlign })
      return 'LEFT'
    }
    return result
  }

  private get _frame(): Octopus['TextFrame'] {
    const mode = getMapped(this.sourceLayer.defaultStyle?.textAutoResize, OctopusLayerText.FRAME_MODE_MAP, 'FIXED')

    const { x: width, y: height } = this.sourceLayer.size ?? {}
    const size = width !== undefined && height !== undefined ? { width, height } : undefined

    return { mode, size }
  }

  private get _text(): Octopus['Text'] | null {
    const value = this.sourceLayer.characters
    const defaultStyle = this._defaultStyle
    if (!defaultStyle) return null
    const styles = this._styles
    const horizontalAlign = this.horizontalAlign
    const verticalAlign = this.sourceLayer.defaultStyle?.textAlignVertical
    const frame = this._frame
    const baselinePolicy = 'OFFSET_ASCENDER'

    const text: Octopus['Text'] = { value, defaultStyle, styles, horizontalAlign, verticalAlign, frame, baselinePolicy }

    return normalizeText(text)
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['TextLayer']> | null {
    const text = this._text
    if (!text) return null

    return { type: 'TEXT', text }
  }

  convert(): Octopus['TextLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
