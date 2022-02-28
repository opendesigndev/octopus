import { LayerSpecifics, OctopusLayerBase, OctopusLayerParent } from './octopus-layer-base'
import type { Octopus } from '../../typings/octopus'
import type { SourceLayerText } from '../source/source-layer-text'
import type { SourceText } from '../source/source-text'
import type { SourceTextStyleRange } from '../source/source-text-style-range'
import { SourceTextStyle } from '../source/source-text-style'
import { asArray, asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { isEqual, isEmpty } from 'lodash'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import { convertMatrix, pointsToPixels } from '../../utils/convert'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerText
}

export class OctopusLayerText extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerText

  constructor(options: OctopusLayerTextOptions) {
    super(options)
  }

  private get _textValue(): string {
    return this._sourceLayer.text.textKey
  }

  private get _sourceText(): SourceText {
    return this._sourceLayer.text
  }

  private get _sourceTextStyleRanges(): SourceTextStyleRange[] {
    return this._sourceText.textStyles
  }

  private get _defaultStyle(): Octopus['TextStyle'] {
    const occurrences: { [key in keyof Octopus['TextStyle']]: { value: unknown; range: number }[] } = {}

    this._sourceTextStyleRanges.forEach((textStyleRange: SourceTextStyleRange) => {
      const { from, to, textStyle } = textStyleRange
      const range = asFiniteNumber(to - from, 0)
      if (range === 0) return
      const style = this._parseStyle(textStyle)
      const styleKeys = Object.keys(style) as (keyof typeof style)[]
      styleKeys.forEach((occurrenceKey) => {
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
    })

    const defaultStyle = Object.entries(occurrences).reduce((defaultStyle, [key, occurrence]) => {
      if (occurrence.length === 0) return
      occurrence.sort((value1, value2) => value2.range - value1.range)
      defaultStyle[key as keyof typeof occurrences] = occurrence[0].value
      return defaultStyle
    }, {} as { [key in keyof Octopus['TextStyle']]: unknown })
    return defaultStyle as Octopus['TextStyle']
  }

  private _getFont(textStyle: SourceTextStyle): Octopus['TextStyle']['font'] {
    return {
      postScriptName: textStyle.fontPostScriptName,
      family: textStyle.fontName,
      style: textStyle.fontStyleName,
    }
  }

  private _getLigatures(textStyle: SourceTextStyle): Octopus['TextStyle']['ligatures'] {
    if (!textStyle.ligatures) return 'NONE'
    if (textStyle.altLigature) return 'ALL'
    return 'STANDARD'
  }

  private _getLetterCase(textStyle: SourceTextStyle): Octopus['TextStyle']['letterCase'] {
    switch (textStyle.letterCase) {
      case 'allCaps':
        return 'UPPERCASE'
      case 'smallCaps':
        return 'SMALL_CAPS'
      default:
        return 'NONE'
    }
  }

  private _getFills(textStyle: SourceTextStyle): Octopus['TextStyle']['fills'] {
    const color = textStyle.color
    const fill = new OctopusEffectFillColor({ color }).convert()
    return [fill]
  }

  private _parseStyle(textStyle: SourceTextStyle): Octopus['TextStyle'] {
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
    const styleProps = Object.keys(style) as (keyof Octopus['TextStyle'])[]
    styleProps.forEach((styleProp) => {
      if (!isEqual(style[styleProp], defaultStyle[styleProp])) {
        ownFont[styleProp] = style[styleProp]
      }
    })
    return ownFont as Octopus['TextStyle']
  }

  private _getStyles(defaultStyle: Octopus['TextStyle']): Octopus['StyleRange'][] {
    const styleRanges = [] as Array<{
      style: Octopus['TextStyle']
      ranges: Array<{ from: number; to: number }>
    }>
    this._sourceTextStyleRanges.forEach((styleRange: SourceTextStyleRange) => {
      const { from, to, textStyle } = styleRange
      const range = asFiniteNumber(to - from, 0)
      if (range === 0) return

      const parsedStyle = this._parseStyle(textStyle)
      const style = this._subtractDefaultStyle(parsedStyle, defaultStyle)
      if (isEmpty(style)) return

      const foundOccurrence = styleRanges.find((styleRange) => isEqual(styleRange.style, style))
      if (foundOccurrence === undefined) {
        styleRanges.push({ style, ranges: [{ from, to }] })
      } else {
        foundOccurrence.ranges.push({ from, to })
      }
    })
    return styleRanges as Octopus['StyleRange'][]
  }

  private get _textTransform(): Octopus['Transform'] {
    return convertMatrix(this._sourceText.transform)
  }

  private get _frame(): Octopus['TextFrame'] {
    const boundingBox = this._sourceText.boundingBox
    const resolution = this.parentArtboard.sourceArtboard.resolution
    const width = pointsToPixels(boundingBox.width, resolution)
    const height = pointsToPixels(boundingBox.height, resolution)
    return { mode: 'FIXED', size: { width, height } }
  }

  get text(): Octopus['Text'] | null {
    const value = this._textValue
    const defaultStyle = this._defaultStyle
    if (!defaultStyle) return null
    const styles = this._getStyles(defaultStyle)
    const textTransform = this._textTransform
    const frame = this._frame

    // TODO add text picture when octopus3 schema is prepared

    return {
      value,
      defaultStyle,
      baselinePolicy: 'FIXED_OFFSET',
      styles,
      textTransform,
      frame,
    }
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['TextLayer']> | null {
    const text = this.text
    if (!text) return null
    return { type: 'TEXT', text } as const
  }

  convert(): Octopus['TextLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
