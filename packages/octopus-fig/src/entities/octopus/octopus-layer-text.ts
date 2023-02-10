import { firstCallMemo } from '@opendesign/octopus-common/decorators/first-call-memo'
import { normalizeText } from '@opendesign/octopus-common/postprocessors/normalize-text'
import { getMapped } from '@opendesign/octopus-common/utils/common'

import { logger } from '../../services'
import { DEFAULTS } from '../../utils/defaults'
import { notZero } from '../../utils/misc'
import { inferPostScriptName } from '../../utils/text'
import { OctopusFill } from './octopus-fill'
import { OctopusLayerBase } from './octopus-layer-base'
import { OctopusStroke } from './octopus-stroke'

import type { Octopus } from '../../typings/octopus'
import type { SourceLayerText } from '../source/source-layer-text'
import type { SourcePaint } from '../source/source-paint'
import type { SourceTextStyle } from '../source/source-text-style'
import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base'

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

  private async _getFills(fills: SourcePaint[]): Promise<Octopus['Fill'][]> {
    const converted = await Promise.all(fills.map((fill) => new OctopusFill({ fill, parentLayer: this }).convert()))
    return converted.filter((fill): fill is Octopus['Fill'] => Boolean(fill))
  }

  private async _fills(): Promise<Octopus['Fill'][]> {
    return this._getFills(this.sourceLayer.fills)
  }

  private async _strokes(): Promise<Octopus['VectorStroke'][]> {
    const strokes = this.sourceLayer.strokes
    const converted = await Promise.all(strokes.map((fill) => new OctopusStroke({ fill, parentLayer: this }).convert()))
    return converted.filter((stroke): stroke is Octopus['VectorStroke'] => Boolean(stroke))
  }

  private _parsePostScriptName(textStyle: SourceTextStyle): string | null {
    const originalPostScriptName = textStyle.fontPostScriptName
    if (originalPostScriptName) return originalPostScriptName
    const { fontFamily, fontStyle, fontWeight, italic } = textStyle
    return inferPostScriptName({ fontFamily, fontStyle, fontWeight, italic })
  }

  private _getFont(textStyle: SourceTextStyle): Octopus['TextStyle']['font'] | undefined {
    const postScriptName = this._parsePostScriptName(textStyle)
    const syntheticPostScriptName = !textStyle.fontPostScriptName ? true : undefined
    if (!postScriptName) return undefined
    return { postScriptName, family: textStyle.fontFamily, syntheticPostScriptName }
  }

  private _getLineHeight(textStyle: SourceTextStyle): number | undefined {
    const lhPx = textStyle.lineHeightPx
    const lhPercent = textStyle.lineHeightPercent
    if (lhPx === undefined && lhPercent === undefined) return undefined
    return lhPercent === 100 ? 0 : notZero(lhPx ?? 0)
  }

  private async _getStyle(textStyle: SourceTextStyle): Promise<Octopus['TextStyle'] | null> {
    const font = this._getFont(textStyle)
    const fontSize = textStyle.fontSize
    const lineHeight = this._getLineHeight(textStyle)
    const kerning = textStyle.kerning
    const letterSpacing = textStyle.letterSpacing

    const letterCase = getMapped(textStyle.textCase, OctopusLayerText.TEXT_CASE_MAP, undefined)

    const textDecoration = textStyle.textDecoration
    const underline = textDecoration === undefined ? undefined : textDecoration === 'UNDERLINE' ? 'SINGLE' : 'NONE'
    const linethrough = textDecoration === undefined ? undefined : textDecoration === 'STRIKETHROUGH'

    const fills = textStyle.textFills && (await this._getFills(textStyle.textFills))

    return { font, fontSize, lineHeight, kerning, letterSpacing, underline, linethrough, letterCase, fills }
  }

  @firstCallMemo()
  private async _defaultStyle(): Promise<Octopus['TextStyle'] | null> {
    const textStyle = this.sourceLayer.defaultStyle
    if (!textStyle) return null
    const font = this._getFont(textStyle)
    if (!font) {
      logger?.warn('Unknown font', { textStyle })
      return null
    }

    const fontSize = textStyle.fontSize ?? DEFAULTS.TEXT.FONT_SIZE
    const lineHeight = this._getLineHeight(textStyle)
    const kerning = textStyle.kerning === false ? false : undefined
    const letterSpacing = textStyle.letterSpacing

    const letterCase = getMapped(textStyle.textCase, OctopusLayerText.TEXT_CASE_MAP, undefined)

    const textDecoration = textStyle.textDecoration
    const underline = textDecoration === 'UNDERLINE' ? 'SINGLE' : undefined
    const linethrough = textDecoration === 'STRIKETHROUGH' ? true : undefined

    const fills = textStyle.textFills?.length ? await this._getFills(textStyle.textFills) : await this._fills()
    const strokes = await this._strokes()

    return { font, fontSize, lineHeight, kerning, letterSpacing, underline, linethrough, letterCase, fills, strokes }
  }

  @firstCallMemo()
  private async _styles(): Promise<Octopus['StyleRange'][]> {
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

    const styles = await Promise.all(
      Object.keys(overrideMap).map(async (key) => {
        const sourceStyle = overrideTable[key]
        if (!sourceStyle) return null

        const style = await this._getStyle(sourceStyle)
        if (!style) return null

        const positions = overrideMap[key]
        if (!positions) return null
        const ranges = positions.map((from) => ({ from, to: from + 1 }))

        return { style, ranges }
      })
    )
    return styles.filter((style): style is Octopus['StyleRange'] => Boolean(style))
  }

  get horizontalAlign(): Octopus['Text']['horizontalAlign'] {
    const horizontalAlign = this.sourceLayer.defaultStyle?.textAlignHorizontal
    const result = getMapped(horizontalAlign, OctopusLayerText.HORIZONTAL_ALIGN_MAP, undefined)
    if (!result) {
      logger?.warn('Unknown horizontal Align', { horizontalAlign })
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

  private async _text(): Promise<Octopus['Text'] | null> {
    const value = this.sourceLayer.characters
    const defaultStyle = await this._defaultStyle()
    if (!defaultStyle) return null
    const styles = await this._styles()
    const horizontalAlign = this.horizontalAlign
    const verticalAlign = this.sourceLayer.defaultStyle?.textAlignVertical
    const frame = this._frame
    const baselinePolicy = 'OFFSET_ASCENDER'

    const text: Octopus['Text'] = { value, defaultStyle, styles, horizontalAlign, verticalAlign, frame, baselinePolicy }

    return normalizeText(text)
  }

  private async _convertTypeSpecific(): Promise<LayerSpecifics<Octopus['TextLayer']> | null> {
    const text = await this._text()
    if (!text) return null

    return { type: 'TEXT', text }
  }

  async convert(): Promise<Octopus['TextLayer'] | null> {
    const common = this.convertBase()
    if (!common) return null

    const specific = await this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
