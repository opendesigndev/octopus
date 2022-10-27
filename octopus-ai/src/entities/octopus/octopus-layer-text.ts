import { normalizeText } from '@opendesign/octopus-common/dist/postprocessors/text'
import { asArray } from '@opendesign/octopus-common/dist/utils/as'
import flatten from 'lodash/flatten'

import { TextLayerGroupingservice } from '../../services/conversion/text-layer-grouping-service'
import { removeTrailingHyphen } from '../../utils/text'
import { OctopusLayerCommon } from './octopus-layer-common'
import OctopusSubText from './octopus-subtext'

import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { AdditionalTextDataText } from '../../typings/raw'
import type { SourceLayerText } from '../source/source-layer-text'
import type { LayerSpecifics } from './octopus-layer-common'
import type { Nullish } from '@opendesign/octopus-common/dist/utils/utility-types'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

export class OctopusLayerText extends OctopusLayerCommon {
  static HYPHEN = '-'
  static MIN_LINE_HEIGHT = 1
  static DEFAULT_TEXT_LAYER_NAME = '<TextLayer>'

  protected _sourceLayers: SourceLayerText[]
  private _octopusSubTexts: Octopus['Text'][]
  private _octopusTextValue: Nullish<string>
  private _additionalTextDataText: Nullish<AdditionalTextDataText>

  constructor({ layerSequence, parent }: OctopusLayerTextOptions) {
    super({ layerSequence, parent })

    const { additionalTextDataText, sourceLayers } = layerSequence
    this._sourceLayers = sourceLayers as SourceLayerText[]

    const octopusSubTexts = flatten(
      asArray(
        this._sourceLayers.map((sourceLayer) => {
          return sourceLayer.texts?.map((sourceLayer) => new OctopusSubText({ sourceLayer }).convert())
        })
      )
    ).filter((octopusSubText) => !!octopusSubText) as Octopus['Text'][]

    this._octopusSubTexts = this._getSubtextsWithLineHeights([...octopusSubTexts])
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
    prevLineHeight: Nullish<number>,
    currentTy: Nullish<number>,
    prevTy: Nullish<number>
  ): Nullish<number> {
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
    let prevLineHeight: Nullish<number>

    return octopusSubTexts.map((octopusSubText, index) => {
      const prevIndex = index - 1

      const prevTy = octopusSubTexts[prevIndex]?.transform?.[5]
      const currentTy = octopusSubText.transform?.[5]
      const lineHeight = this._getLineHeight(prevLineHeight, currentTy, prevTy)
      prevLineHeight = lineHeight

      if (!lineHeight) {
        return { ...octopusSubText }
      }

      return { ...octopusSubText, defaultStyle: { ...octopusSubText.defaultStyle, lineHeight } }
    })
  }

  private _getOctopusTextSliceLength(subtext: string): Nullish<number> {
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

    if (TextLayerGroupingservice.OCTOPUS_EXTRA_CHARACTERS.includes(this._octopusTextValue[octopusStringLength])) {
      octopusStringLength = octopusStringLength + 1
    }
    return octopusStringLength
  }

  private _getOctopusTextSlice(subtext: string, isLast: boolean): Nullish<string> {
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

  private _getFrame(): Nullish<Octopus['TextFrame']> {
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

    const octopusTextWithStyles = { ...mergedText, styles: asArray(mergedText.styles) }
    const frame = this._getFrame()

    return frame ? { ...octopusTextWithStyles, frame } : octopusTextWithStyles
  }

  private _parseName(text: Octopus['Text']): string {
    const textValue = text.value
    if (!textValue) {
      return this._sourceLayer?.name ?? OctopusLayerText.DEFAULT_TEXT_LAYER_NAME
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
      text: normalizeText(text),
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
