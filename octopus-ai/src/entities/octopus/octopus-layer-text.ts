import isEqual from 'lodash/isEqual'
import flatten from 'lodash/flatten'
import pick from 'lodash/pick'
import without from 'lodash/without'
import { asArray } from '@avocode/octopus-common/dist/utils/as'

import OctopusLayerCommon from './octopus-layer-common'
import OctopusSubText from './octopus-subtext'
import { removeTrailingHyphen } from '../../utils/text'
import AdditionalTextDataParser from '../../services/conversion/private-data-parser'

import type { Octopus } from '../../typings/octopus'
import type SourceLayerText from '../source/source-layer-text'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { LayerSpecifics } from './octopus-layer-common'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type { AdditionalTextDataText } from '../../typings/additional-text-data'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayers: SourceLayerText[]
}

type Range = {
  from: number
  to: number
}

export default class OctopusLayerText extends OctopusLayerCommon {
  static HYPHEN = '-'
  static MIN_LINE_HEIGHT = 1

  protected _sourceLayers: SourceLayerText[]
  private _octopusSubTexts: Octopus['Text'][]
  private _octopusTextValue: Nullable<string>
  private _additionalTextDataText: Nullable<AdditionalTextDataText>

  constructor(options: OctopusLayerTextOptions) {
    super(options)
    this._sourceLayers = options.sourceLayers

    const octopusSubTexts = flatten(
      asArray(
        options.sourceLayers.map((sourceLayer) => {
          return sourceLayer.texts?.map((sourceLayer) => new OctopusSubText({ sourceLayer }).convert())
        })
      )
    ).filter((octopusSubText) => !!octopusSubText) as Octopus['Text'][]

    this._octopusSubTexts = this._getSubtextsWithLineHeights([...octopusSubTexts])
    const additionalTextDataText = this.parentArtboard.additionalTextDataParser?.getOctopusText(this._sourceLayers)
    this._additionalTextDataText = additionalTextDataText
    this._octopusTextValue = additionalTextDataText?.content
  }

  private _createNewStyle(from: number, subtext: Octopus['Text']): Octopus['StyleRange'] {
    return {
      style: { ...subtext.defaultStyle },
      ranges: [{ from, to: from + subtext.value.length }],
    }
  }

  private _getLineHeight(
    prevLineHeight: Nullable<number>,
    currentTy: Nullable<number>,
    prevTy: Nullable<number>
  ): Nullable<number> {
    if (!currentTy || !prevTy) {
      return prevLineHeight
    }

    const newLineHeight = currentTy - prevTy
    if (newLineHeight < OctopusLayerText.MIN_LINE_HEIGHT) {
      return prevLineHeight
    }

    return newLineHeight
  }

  private _getSubtextsWithLineHeights(octopusSubTexts: Octopus['Text'][]): Octopus['Text'][] {
    let prevLineHeight: Nullable<number>

    return octopusSubTexts.map((octopusSubText, index) => {
      const prevIndex = index - 1

      const prevTy = octopusSubTexts[prevIndex]?.textTransform?.[5]
      const currentTy = octopusSubText.textTransform?.[5]
      const lineHeight = this._getLineHeight(prevLineHeight, currentTy, prevTy)
      prevLineHeight = lineHeight

      if (!lineHeight) {
        return { ...octopusSubText }
      }

      return { ...octopusSubText, defaultStyle: { ...octopusSubText.defaultStyle, lineHeight } }
    })
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

  private _getOctopusTextSliceLength(subtext: string): Nullable<number> {
    if (!this._octopusTextValue) {
      return null
    }

    let octopusStringLength = 0

    if (this._octopusTextValue?.indexOf(subtext) === 0) {
      octopusStringLength = subtext.length
    } else if (this._octopusTextValue?.indexOf(removeTrailingHyphen(subtext)) === 0) {
      octopusStringLength = removeTrailingHyphen(subtext).length
    } else if (subtext !== OctopusLayerText.HYPHEN) {
      return
    }

    if (AdditionalTextDataParser.OCTOPUS_EXTRA_CHARACTERS.includes(this._octopusTextValue[octopusStringLength])) {
      octopusStringLength = octopusStringLength + 1
    }
    return octopusStringLength
  }

  private _getOctopusTextSlice(subtext: string, isLast: boolean): Nullable<string> {
    if (isLast || !this._octopusTextValue) {
      return this._octopusTextValue
    }

    const octopusStringLength = this._getOctopusTextSliceLength(subtext)

    if (typeof octopusStringLength !== 'number') {
      return
    }

    const octopusTextSlice = this._octopusTextValue.slice(0, octopusStringLength)
    this._octopusTextValue = this._octopusTextValue.slice(octopusStringLength)

    return octopusTextSlice
  }

  private _getFrame(): Nullable<Octopus['TextFrame']> {
    const width = this._additionalTextDataText?.frame?.width
    const height = this._additionalTextDataText?.frame?.height
    if (!width || !height) {
      return
    }

    return { mode: 'FIXED', size: { width, height } }
  }

  private _parseText(): Octopus['Text'] {
    const mergedText = this._octopusSubTexts.reduce(
      (merged: Octopus['Text'], subtext: Octopus['Text'], index: number) => {
        const isLast = this._octopusSubTexts.length - 1 === index
        const octopusTextSlice = this._getOctopusTextSlice(subtext.value, isLast)
        console.error('___octopusTextSlice', octopusTextSlice)
        if (typeof octopusTextSlice === 'string') {
          subtext = { ...subtext, value: octopusTextSlice }
        }

        if (typeof merged.value !== 'string') {
          return {
            ...subtext,
            styles: [this._createNewStyle(0, subtext)],
          }
        }

        return {
          ...merged,
          value: merged.value + subtext.value,
          styles: [...(merged.styles ?? []), this._createNewStyle(merged.value.length, subtext)],
        }
      },
      {} as Octopus['Text']
    )

    const octopusTextWithStyles = { ...mergedText, styles: this._getUnifiedStyles(asArray(mergedText.styles)) }
    const frame = this._getFrame()

    return frame ? { ...octopusTextWithStyles, frame } : octopusTextWithStyles
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
