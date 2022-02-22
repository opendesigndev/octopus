import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { Octopus } from '../../typings/octopus'
import type { SourceLayerText } from '../source/source-layer-text'
import type { SourceText } from '../source/source-text'
import type { SourceTextStyleRange } from '../source/source-text-style-range'
import { SourceTextStyle } from '../source/source-text-style'
import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { isEqual } from 'lodash'
import { ElementOf } from '@avocode/octopus-common/dist/utils/utility-types'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerText
}

type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never

// const keys = Object.keys(occs) as (keyof typeof occs)[]
// keys.forEach(key => {
//   const distributedValues = occs[key]
//   const values = occs[key] as ToArrayNonDist<ElementOf<typeof distributedValues>>
//   values.find((value) => {
//     value.a
//   })
// })

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
    // type Occurrences = Record<string, {value: textFont[occurrenceKey], occurrence: number}[]>
    type Occurrence = { value: unknown; range: number }
    type Occurrences = typeof occurrences
    type OccurrenceKeys = keyof Occurrences
    const occurrences = {
      font: [] as Occurrence[],
      fontSize: [] as Occurrence[],
      lineHeight: [] as Occurrence[],
      letterSpacing: [] as Occurrence[],
      kerning: [] as Occurrence[],
      features: [] as Occurrence[],
      ligatures: [] as Occurrence[],
      underline: [] as Occurrence[],
      linethrough: [] as Occurrence[],
      letterCase: [] as Occurrence[],
      fills: [] as Occurrence[],
      strokes: [] as Occurrence[],
      // font: [] as { value: Octopus['TextStyle']['font']; range: number }[],
      // fontSize: [] as { value: Octopus['TextStyle']['fontSize']; range: number }[],
      // lineHeight: [] as { value: Octopus['TextStyle']['lineHeight']; range: number }[],
      // letterSpacing: [] as { value: Octopus['TextStyle']['letterSpacing']; range: number }[],
      // kerning: [] as { value: Octopus['TextStyle']['kerning']; range: number }[],
      // features: [] as { value: Octopus['TextStyle']['features']; range: number }[],
      // ligatures: [] as { value: Octopus['TextStyle']['ligatures']; range: number }[],
      // underline: [] as { value: Octopus['TextStyle']['underline']; range: number }[],
      // linethrough: [] as { value: Octopus['TextStyle']['linethrough']; range: number }[],
      // letterCase: [] as { value: Octopus['TextStyle']['letterCase']; range: number }[],
      // fills: [] as { value: Octopus['TextStyle']['fills']; range: number }[],
      // strokes: [] as { value: Octopus['TextStyle']['strokes']; range: number }[],
    }

    this.sourceTextStyleRanges.forEach((textStyleRange: SourceTextStyleRange) => {
      const { from, to, textStyle } = textStyleRange
      const range = asFiniteNumber(to - from, 0)
      if (range === 0) return
      const style = this._parseStyle(textStyle)

      const styleKeys = Object.keys(style) as OccurrenceKeys[]
      styleKeys.forEach((occurrenceKey) => {
        const occurrenceValues = occurrences[occurrenceKey]
        const styleValue = style[occurrenceKey]

        // TODO NIKI

        // const distributedOccurrenceValues = occurrences[occurrenceKey]
        // const occurrenceValues = occurrences[occurrenceKey] as ToArrayNonDist<
        //   ElementOf<typeof distributedOccurrenceValues>
        // >

        // Check if there already exists a textStyle property with such a value.
        const foundOccurrence = occurrenceValues.find((occurrenceObject) => isEqual(occurrenceObject.value, styleValue))
        if (foundOccurrence === undefined) {
          // If not, add new textStyle property value with occurrence range.
          occurrences[occurrenceKey].push({ value: styleValue, range })
        } else {
          // If there already exists such value of that prop, just increase occurrence.
          foundOccurrence.range += range
        }
      })
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultStyle = {} as any // Find properties' values with highest occurrence.
    const occurrencesKeys = Object.keys(occurrences) as OccurrenceKeys[]
    occurrencesKeys.forEach((key) => {
      if (occurrences[key].length === 0) return
      occurrences[key].sort((value1, value2) => value2.range - value1.range)
      // First value is the value with highest occurrence.
      defaultStyle[key] = occurrences[key][0].value
    })

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
