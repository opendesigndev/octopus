import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { Octopus } from '../../typings/octopus'
import type { SourceLayerText } from '../source/source-layer-text'
import type { SourceText } from '../source/source-text'
import type { SourceTextStyleRange } from '../source/source-text-style-range'
import { SourceTextStyle } from '../source/source-text-style'
import { asArray, asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { isEqual } from 'lodash'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerText
}

export class OctopusLayerText extends OctopusLayerCommon {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerText

  constructor(options: OctopusLayerTextOptions) {
    super(options)
  }

  get textValue(): string {
    return this._sourceLayer.text.textKey
  }

  get sourceText(): SourceText {
    return this._sourceLayer.text
  }

  get sourceTextStyleRanges(): SourceTextStyleRange[] {
    return this.sourceText.textStyles
  }

  private _getDefaultStyle(): Octopus['TextStyle'] {
    /**
     * Ono to chtelo trochu se zamyslet, ale nakonec neni imo ani potreba mit ten occurences s
     * preddefinovanymi klicma + ted' uz tu neni zadny `any`.
     * Radsi si to ale vyzkousej na vic examplech jestli ti to funguje jak ma.
     */
    const occurrences: { [key in keyof Octopus['TextStyle']]: { value: unknown; range: number }[] } = {}

    this.sourceTextStyleRanges.forEach((textStyleRange: SourceTextStyleRange) => {
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

    const defaultStyle = Object.entries(occurrences).reduce((defaultStyle, [key, occurance]) => {
      if (occurance.length === 0) return
      occurance.sort((value1, value2) => value2.range - value1.range)
      defaultStyle[key as keyof typeof occurrences] = occurance[0].value
      return defaultStyle
    }, {} as { [key in keyof Octopus['TextStyle']]: unknown })

    console.info('defaultStyle', defaultStyle)

    return defaultStyle as Octopus['TextStyle']
  }

  private _getFont(textStyle: SourceTextStyle): Octopus['TextStyle']['font'] {
    return {
      postScriptName: textStyle.fontPostScriptName,
      family: textStyle.fontName,
      style: textStyle.fontStyleName,
    }
  }

  private _parseStyle(textStyle: SourceTextStyle): Octopus['TextStyle'] {
    return {
      font: this._getFont(textStyle),
    }
  }

  private _getStyle(styleRange: SourceTextStyleRange): Octopus['StyleRange'] {
    const { from, to, textStyle } = styleRange
    const ranges = [{ from, to }] // TODO add optimization to merge same styles
    const style = this._parseStyle(textStyle)
    return { ranges, style }
  }

  private _getStyles(): Octopus['StyleRange'][] {
    return this.sourceTextStyleRanges.map((style) => this._getStyle(style))
  }

  get text(): Octopus['Text'] | null {
    const value = this.textValue
    const defaultStyle = this._getDefaultStyle()
    if (!defaultStyle) return null
    const styles = this._getStyles()
    // const frame = {} as Octopus['TextFrame'] // this._getFrame() // TODO

    return {
      value,
      defaultStyle,
      baselinePolicy: 'SET',
      styles,
      // frame,
    }
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['TextLayer']> | null {
    const text = this.text
    if (!text) return null
    return { type: 'TEXT', text } as const
  }

  convert(): Octopus['TextLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
