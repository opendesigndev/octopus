import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

import type SourceLayerText from '../../../entities/source/source-layer-text'
import type { SourceLayer } from '../../../factories/create-source-layer'
import type { AdditionalTextData, AdditionalTextDataText } from '../../../typings/additional-text-data'
import { removeTrailingHyphen } from '../../../utils/text'

type CurrentMatch = AdditionalTextDataText & {
  remainder: string
}

export type LayerSequence = {
  sourceLayers: SourceLayer[]
  additionalTextDataText?: AdditionalTextDataText
}

export default class SourceLayerGroupingService {
  static END_LINE = '\r'
  static DOUBLE_END_LINE = '\r\r'
  static END_LINE_OCTOPUS = '\n'
  static DOUBLE_END_LINE_OCTOPUS = '\u2029'

  static ADDITIONAL_TEXT_DATA_DICTIONARY = {
    [SourceLayerGroupingService.END_LINE]: SourceLayerGroupingService.END_LINE_OCTOPUS,
    [SourceLayerGroupingService.DOUBLE_END_LINE]: SourceLayerGroupingService.DOUBLE_END_LINE_OCTOPUS,
  }
  static OCTOPUS_DICTIONARY = {
    [SourceLayerGroupingService.END_LINE]: '',
    [SourceLayerGroupingService.DOUBLE_END_LINE]: '',
  }

  static SPECIAL_CHARACTERS = Object.keys(SourceLayerGroupingService.OCTOPUS_DICTIONARY).sort(
    (a, b) => b.length - a.length
  )
  static TEXT_LAYER = 'TextGroup'
  static MIN_HEIGHT_DIFFERENCE = 0.1
  static OCTOPUS_EXTRA_CHARACTERS = [
    SourceLayerGroupingService.END_LINE_OCTOPUS,
    SourceLayerGroupingService.DOUBLE_END_LINE_OCTOPUS,
  ]

  private _originalAdditionalTextData: Nullable<AdditionalTextData>
  private _additionalTextDataWithOctopusSpecialCharacters: Nullable<AdditionalTextData>
  private _additionalTextData?: AdditionalTextData
  private _currentMatches: Nullable<CurrentMatch[]>
  private _layerSequences: LayerSequence[] = []
  private _lastTextLayerSequence: Nullable<LayerSequence>

  constructor(additionalTextData: Nullable<AdditionalTextData>) {
    this._originalAdditionalTextData = additionalTextData
    this._additionalTextDataWithOctopusSpecialCharacters = this._initAdditionalTextData(
      SourceLayerGroupingService.ADDITIONAL_TEXT_DATA_DICTIONARY
    )
    this._additionalTextData = this._initAdditionalTextData(SourceLayerGroupingService.OCTOPUS_DICTIONARY)
    this._currentMatches = []
  }

  private _replaceAllSpecialCharacters(text: string, dictionary: Record<string, string>) {
    const specialCharacters = Object.keys(dictionary).sort((a, b) => b.length - a.length)

    for (let i = 0; i < specialCharacters.length; i += 1) {
      const specialCharacter = specialCharacters[i]
      const replaceValue = dictionary[specialCharacter]
      text = text.split(specialCharacter).join(replaceValue)
    }

    return text
  }

  private _initAdditionalTextData(dictionary: Record<string, string>): AdditionalTextData {
    const originalAdditionalTextData = this._originalAdditionalTextData

    return {
      ...originalAdditionalTextData,
      texts: originalAdditionalTextData?.texts?.map((text) => {
        const content = text.content
        return {
          ...text,
          content: content ? this._replaceAllSpecialCharacters(content, dictionary) : content,
        }
      }),
    }
  }

  private _getRemainingTextMatches(sourceLayerText: SourceLayerText): Nullable<CurrentMatch[]> {
    const sourceText = sourceLayerText.textValue
    const octopusStringLengths: number[] = []

    const currentMatches = this._currentMatches?.filter(({ remainder }) => {
      if (remainder.indexOf(sourceText) === 0) {
        octopusStringLengths.push(sourceText.length)

        return true
      }

      if (remainder.indexOf(removeTrailingHyphen(sourceText)) === 0) {
        octopusStringLengths.push(sourceText.length - 1)
        return true
      }

      return false
    })

    if (currentMatches?.length === 0) {
      return []
    }

    return currentMatches?.map((match, index) => ({
      ...match,
      remainder: match.remainder.slice(octopusStringLengths[index]),
    }))
  }

  private _setCurrentMatches(sourceLayerText: SourceLayerText) {
    const texts = this._additionalTextData?.texts
    if (!texts) {
      return
    }

    this._currentMatches = texts
      .map((text) => ({ ...text, remainder: text.content }))
      .filter((text) => typeof text.content === 'string') as CurrentMatch[]

    this._currentMatches = this._getRemainingTextMatches(sourceLayerText)
  }

  private _eliminateMatchFromAdditionalTextData(bestMatch: Nullable<CurrentMatch>): void {
    if (!bestMatch) {
      return
    }

    this._additionalTextData = {
      ...this._additionalTextData,
      texts: this._additionalTextData?.texts?.filter((text) => text.index !== bestMatch.index),
    }
  }

  private _isSourceLayerPartOfLastTextSequence(sourceLayerText: SourceLayerText): boolean {
    const sourceText = sourceLayerText.textValue
    return !!this._currentMatches?.find(({ remainder }) => {
      if (remainder.indexOf(sourceText) === 0) {
        return true
      }

      if (remainder.indexOf(removeTrailingHyphen(sourceText)) === 0) {
        return true
      }
    })
  }

  private _getBestMatch(): Nullable<CurrentMatch> {
    if (!this._currentMatches?.length) {
      return null
    }

    let bestMatch = { ...this._currentMatches[0] }

    for (let i = 0; i < this._currentMatches.length; i += 1) {
      const match = this._currentMatches[i]
      if (match.remainder.length < bestMatch.remainder.length) {
        bestMatch = match
      }
    }

    const content = this._additionalTextData?.texts?.filter((text) => text.index === bestMatch.index)[0]?.content

    bestMatch = {
      ...bestMatch,
      content,
    }

    return bestMatch
  }

  private _addBestMatchToLastTextLayerSequence(): void {
    const bestMatch = this._getBestMatch()
    const lastTextLayerSequence = this._lastTextLayerSequence

    if (bestMatch && typeof bestMatch.index === 'number' && lastTextLayerSequence) {
      this._eliminateMatchFromAdditionalTextData(bestMatch)
      lastTextLayerSequence.additionalTextDataText = {
        ...this._additionalTextDataWithOctopusSpecialCharacters?.texts?.find(
          (additionalText) => additionalText.index === bestMatch.index
        ),
      }
    }
  }

  private _setNewLastLayerTextSequence(sourceLayerText: SourceLayerText): void {
    if (this._lastTextLayerSequence) {
      this._addBestMatchToLastTextLayerSequence()
    }

    this._lastTextLayerSequence = { sourceLayers: [sourceLayerText] }
    this._layerSequences.push(this._lastTextLayerSequence)
    this._setCurrentMatches(sourceLayerText)
  }

  private _pushTextLayer(sourceLayerText: SourceLayerText): void {
    if (!this._isSourceLayerPartOfLastTextSequence(sourceLayerText)) {
      this._setNewLastLayerTextSequence(sourceLayerText)
      return
    }

    this._lastTextLayerSequence?.sourceLayers.push(sourceLayerText as SourceLayerText)

    this._currentMatches = this._getRemainingTextMatches(sourceLayerText)
  }

  getLayerSequences(sourceLayers: SourceLayer[]): LayerSequence[] {
    sourceLayers.forEach((sourceLayer: SourceLayer, index: number) => {
      if (sourceLayer.type !== SourceLayerGroupingService.TEXT_LAYER || !this._originalAdditionalTextData) {
        this._layerSequences.push({ sourceLayers: [sourceLayer] })
      } else {
        this._pushTextLayer(sourceLayer as SourceLayerText)
      }

      if (sourceLayers.length - 1 === index) {
        this._addBestMatchToLastTextLayerSequence()
      }
    })
    const layerSequences = [...this._layerSequences]

    this._layerSequences = []

    return layerSequences
  }
}
