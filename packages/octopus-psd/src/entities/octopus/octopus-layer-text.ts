// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { normalizeText } from '@opendesign/octopus-common/dist/postprocessors/normalize-text/index.js'
import { asArray, asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { getMapped, keys } from '@opendesign/octopus-common/dist/utils/common.js'
import { round } from '@opendesign/octopus-common/dist/utils/math.js'
import isEmpty from 'lodash/isEmpty.js'
import isEqual from 'lodash/isEqual.js'

import { OctopusEffectFillColor } from './octopus-effect-fill-color.js'
import { OctopusLayerBase } from './octopus-layer-base.js'
import { createMatrix } from '../../utils/paper-factories.js'

import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceLayerText } from '../source/source-layer-text.js'
import type { SourceTextTextStyleRange } from '../source/source-text-text-style-range.js'
import type { SourceTextTextStyle } from '../source/source-text-text-style.js'
import type { SourceText } from '../source/source-text.js'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerText
}

type Occurrences = { [key in keyof Octopus['TextStyle']]: { value: unknown; range: number }[] }

export class OctopusLayerText extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerText

  static TEXT_ALIGN_MAP = {
    left: 'LEFT',
    center: 'CENTER',
    right: 'RIGHT',
    justifyLeft: 'JUSTIFY',
    justifyRight: 'JUSTIFY',
    justifyCenter: 'JUSTIFY',
    justifyAll: 'JUSTIFY',
  } as const

  constructor(options: OctopusLayerTextOptions) {
    super(options)
  }

  private get _textValue(): string {
    return this._sourceLayer.text.textKey
  }

  private get _sourceText(): SourceText {
    return this._sourceLayer.text
  }

  private get _sourceTextStyleRanges(): SourceTextTextStyleRange[] {
    return this._sourceText.textStyles
  }

  @firstCallMemo()
  private get _defaultStyleOccurrences(): Occurrences {
    return this._sourceTextStyleRanges.reduce((occurrences: Occurrences, textStyleRange: SourceTextTextStyleRange) => {
      const { from, to, textStyle } = textStyleRange
      const range = asFiniteNumber(to - from, 0)
      if (range === 0) return occurrences
      const style = this._parseStyle(textStyle)
      keys(style).forEach((occurrenceKey) => {
        const occurrenceValues = asArray(occurrences[occurrenceKey])
        const styleValue = style[occurrenceKey]
        const foundOccurrence = occurrenceValues.find(({ value }) => isEqual(value, styleValue))
        if (foundOccurrence === undefined) {
          occurrenceValues.push({ value: styleValue, range })
        } else {
          foundOccurrence.range += range
        }
        occurrences[occurrenceKey] = occurrenceValues
      })
      return occurrences
    }, {})
  }

  @firstCallMemo()
  private get _defaultStyle(): Octopus['TextStyle'] {
    const occurrences = this._defaultStyleOccurrences
    const defaultStyle = Object.entries(occurrences).reduce((defaultStyle, [key, occurrence]) => {
      if (occurrence.length === 0) return defaultStyle
      occurrence.sort((value1, value2) => value2.range - value1.range)
      defaultStyle[key as keyof typeof occurrences] = occurrence[0].value
      return defaultStyle
    }, {} as { [key in keyof Octopus['TextStyle']]: unknown })
    return defaultStyle as Octopus['TextStyle']
  }

  private _getFont(textStyle: SourceTextTextStyle): Octopus['TextStyle']['font'] {
    return {
      postScriptName: textStyle.fontPostScriptName,
      family: textStyle.fontName,
      style: textStyle.fontStyleName,
    }
  }

  private _getLigatures(textStyle: SourceTextTextStyle): Octopus['TextStyle']['ligatures'] {
    if (!textStyle.ligatures) return 'NONE'
    if (textStyle.altLigature) return 'ALL'
    return 'STANDARD'
  }

  private _getLetterCase(textStyle: SourceTextTextStyle): Octopus['TextStyle']['letterCase'] {
    switch (textStyle.letterCase) {
      case 'allCaps':
        return 'UPPERCASE'
      case 'smallCaps':
        return 'SMALL_CAPS'
      default:
        return 'NONE'
    }
  }

  private _getFills(textStyle: SourceTextTextStyle): Octopus['TextStyle']['fills'] {
    const color = textStyle.color
    const opacity = this.fillOpacity
    const fill = new OctopusEffectFillColor({ color, opacity }).convert()
    return [fill]
  }

  private _parseStyle(textStyle: SourceTextTextStyle): Octopus['TextStyle'] {
    return {
      font: this._getFont(textStyle),
      fontSize: textStyle.size,
      lineHeight: textStyle.lineHeight,
      letterSpacing: textStyle.letterSpacing,
      kerning: textStyle.kerning,
      features: textStyle.features,
      ligatures: this._getLigatures(textStyle),
      underline: textStyle.underline ? 'SINGLE' : 'NONE',
      linethrough: textStyle.linethrough,
      letterCase: this._getLetterCase(textStyle),
      fills: this._getFills(textStyle),
    }
  }

  private _subtractDefaultStyle = (
    style: Octopus['TextStyle'],
    defaultStyle: Octopus['TextStyle']
  ): Octopus['TextStyle'] => {
    const ownFont = {} as Record<keyof Octopus['TextStyle'], unknown>
    keys(style).forEach((styleProp) => {
      if (!isEqual(style[styleProp], defaultStyle[styleProp])) {
        ownFont[styleProp] = style[styleProp]
      }
    })
    return ownFont as Octopus['TextStyle']
  }

  private _getStyles(defaultStyle: Octopus['TextStyle']): Octopus['StyleRange'][] {
    return this._sourceTextStyleRanges.reduce(
      (styleRanges: Octopus['StyleRange'][], styleRange: SourceTextTextStyleRange) => {
        const { from, to, textStyle } = styleRange
        const range = asFiniteNumber(to - from, 0)
        if (range === 0) return styleRanges

        const parsedStyle = this._parseStyle(textStyle)
        const style = this._subtractDefaultStyle(parsedStyle, defaultStyle)
        if (isEmpty(style)) return styleRanges

        const foundOccurrence = styleRanges.find((styleRange) => isEqual(styleRange.style, style))
        if (foundOccurrence === undefined) {
          styleRanges.push({ style, ranges: [{ from, to }] })
        } else {
          foundOccurrence.ranges.push({ from, to })
        }
        return styleRanges
      },
      []
    ) as Octopus['StyleRange'][]
  }

  @firstCallMemo()
  private get _transform(): Octopus['Transform'] {
    const { xx, xy, yx, yy, tx, ty } = this._sourceText.transform
    const matrix = createMatrix(xx, xy, yx, yy, tx, ty)
    if (this._sourceText.bounds !== undefined) {
      const { left } = this._sourceText.bounds
      const { top } = this._sourceText.boundingBox ?? this._sourceText.bounds
      matrix.invert()
      matrix.tx -= left
      matrix.ty -= top
      matrix.invert()
    } else {
      const align = this._horizontalAlign
      const { width, height } = this._sourceLayer.bounds
      if (align === 'RIGHT') {
        matrix.tx -= width
        matrix.ty -= height
      }
      if (align === 'CENTER') {
        matrix.tx -= width / 2
        matrix.ty -= height / 2
      }
    }
    return matrix.values
  }

  @firstCallMemo()
  private get _horizontalAlign(): Octopus['Text']['horizontalAlign'] {
    return getMapped(
      this._sourceText.paragraphStyles[0]?.paragraphStyle?.align,
      OctopusLayerText.TEXT_ALIGN_MAP,
      'LEFT'
    )
  }

  private get _frame(): Octopus['TextFrame'] {
    const { width, height } = this._sourceText.bounds || this._sourceLayer.bounds
    return { mode: 'FIXED', size: { width: round(width), height: round(height) } }
  }

  @firstCallMemo()
  get text(): Octopus['Text'] | null {
    const value = this._textValue
    const defaultStyle = this._defaultStyle
    if (!defaultStyle) return null
    const styles = this._getStyles(defaultStyle)
    const transform = this._transform
    const frame = this._frame
    const horizontalAlign = this._horizontalAlign

    const text: Octopus['Text'] = {
      value,
      defaultStyle,
      horizontalAlign,
      baselinePolicy: 'OFFSET_BEARING',
      styles,
      transform,
      frame,
    }
    return normalizeText(text)
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['TextLayer']> | null {
    const text = this.text
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
