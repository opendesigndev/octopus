import { asArray } from '@avocode/octopus-common/dist/utils/as'
import isEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import without from 'lodash/without'

import { OctopusLayerCommon } from './octopus-layer-common'
import OctopusSubText from './octopus-subtext'

import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { SourceLayerText } from '../source/source-layer-text'
import type { LayerSpecifics } from './octopus-layer-common'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerText
}

type Range = {
  from: number
  to: number
}

export class OctopusLayerText extends OctopusLayerCommon {
  protected _sourceLayer: SourceLayerText
  private _octopusSubTexts: OctopusSubText[]

  constructor(options: OctopusLayerTextOptions) {
    super(options)

    this._octopusSubTexts = asArray(
      options.sourceLayer.texts?.map((sourceLayer) => new OctopusSubText({ sourceLayer }))
    )
  }

  private _createNewStyle(from: number, subtext: Octopus['Text']): Octopus['StyleRange'] {
    return {
      style: { ...subtext.defaultStyle },
      ranges: [{ from, to: from + subtext.value.length }],
    }
  }

  private _areStylesEqual(style1: Octopus['StyleRange'], style2: Octopus['StyleRange']): boolean {
    return isEqual(
      pick(style1, without(Object.keys(style1), 'ranges')),
      pick(style2, without(Object.keys(style2), 'ranges'))
    )
  }

  private _getDuplicatesMap(styles: Octopus['StyleRange'][]): Map<Octopus['StyleRange'], Octopus['StyleRange'][]> {
    return styles.reduce((dups, style) => {
      const uniqueStyles = [...dups.keys()]
      const uniqueEntry = uniqueStyles.find((unique) => this._areStylesEqual(unique, style))
      if (uniqueEntry) {
        const uniqueEntryArray = dups.get(uniqueEntry) as Octopus['StyleRange'][]
        uniqueEntryArray.push(style)
      } else {
        dups.set(style, [style])
      }
      return dups
    }, new Map<Octopus['StyleRange'], Octopus['StyleRange'][]>())
  }

  private _getUnifiedRanges(ranges: Range[]): Range[] {
    const fromArray = ranges.map(({ from }) => from).sort((a, b) => a - b)
    const toArray = ranges.map(({ to }) => to).sort((a, b) => a - b)
    const rangesArray = []

    let range = { from: fromArray[0], to: toArray[0] }

    for (let toIndex = 0; toIndex < ranges.length; toIndex += 1) {
      const from = fromArray[toIndex]
      const to = toArray[toIndex]

      if (from <= range.to) {
        range.to = to
      } else {
        rangesArray.push(range)
        range = { from, to }
      }

      if (toIndex === toArray.length - 1) {
        rangesArray.push(range)
      }
    }
    return rangesArray
  }

  private _getUnifiedStyles(styles: Octopus['StyleRange'][]): Octopus['StyleRange'][] {
    const duplicates = this._getDuplicatesMap(styles)
    return [...duplicates.keys()].map((style) => {
      const equalStyles = duplicates.get(style) as Octopus['StyleRange'][]

      return {
        ...style,
        ranges: this._getUnifiedRanges(
          equalStyles.reduce((ranges: Range[], style: Octopus['StyleRange']) => [...ranges, ...style.ranges], [])
        ),
      }
    })
  }

  private _parseText(): Octopus['Text'] {
    const mergedText = this._octopusSubTexts.reduce((merged: Octopus['Text'], subtext: OctopusSubText) => {
      const converted = subtext.convert()
      if (merged.value === undefined || merged.value === null) {
        return {
          ...converted,
          styles: [this._createNewStyle(0, converted)],
        }
      }

      merged.styles?.push(this._createNewStyle(merged.value.length, converted))
      return { ...merged, value: merged.value + converted.value }
    }, {} as Octopus['Text'])

    return { ...mergedText, styles: this._getUnifiedStyles(asArray(mergedText.styles)) }
  }

  private _parseName(text: Octopus['Text']): string {
    const textValue = text.value
    if (!textValue) {
      return this._sourceLayer.name
    }

    if (textValue.length < 100) {
      return textValue
    }

    return textValue.substring(0, 99)
  }

  private _convertTypeSpecific(): (LayerSpecifics<Octopus['TextLayer']> & { name: string }) | null {
    const text = this._parseText()
    const name = this._parseName(text)

    return {
      type: 'TEXT',
      text,
      name,
    }
  }

  convert(): Octopus['TextLayer'] | null {
    const common = this.convertCommon()

    if (!common) {
      return null
    }

    const specific = this._convertTypeSpecific()

    if (!specific) {
      return null
    }

    return {
      ...common,
      ...specific,
    }
  }
}
