import { removeTrailingHyphen } from '../../../utils/text'

import type { AdditionalTextData, AdditionalTextDataText } from '../../../typings/additional-text-data'
import type { SourceLayer } from '../../../factories/create-source-layer'
import type SourceLayerText from '../../../entities/source/source-layer-text'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

type CurrentMatch = AdditionalTextDataText & {
  remainder: string
}

export default class AdditionalTextDataParser {
  static END_LINE = '\r'
  static DOUBLE_END_LINE = '\r\r'
  static END_LINE_OCTOPUS = '\n'
  static DOUBLE_END_LINE_OCTOPUS = '\u2029'

  static ADDITIONAL_TEXT_DATA_DICTIONARY = {
    [AdditionalTextDataParser.END_LINE]: AdditionalTextDataParser.END_LINE_OCTOPUS,
    [AdditionalTextDataParser.DOUBLE_END_LINE]: AdditionalTextDataParser.DOUBLE_END_LINE_OCTOPUS,
  }
  static OCTOPUS_DICTIONARY = {
    [AdditionalTextDataParser.END_LINE]: '',
    [AdditionalTextDataParser.DOUBLE_END_LINE]: '',
  }

  static SPECIAL_CHARACTERS = Object.keys(AdditionalTextDataParser.OCTOPUS_DICTIONARY).sort(
    (a, b) => b.length - a.length
  )
  static TEXT_LAYER = 'TextGroup'
  static MIN_HEIGHT_DIFFERENCE = 0.1
  static OCTOPUS_EXTRA_CHARACTERS = [
    AdditionalTextDataParser.END_LINE_OCTOPUS,
    AdditionalTextDataParser.DOUBLE_END_LINE_OCTOPUS,
  ]

  private _originalAdditionalTextData: AdditionalTextData
  private _additionalTextDataWithOctopusSpecialCharacters: AdditionalTextData
  private _additionalTextData: AdditionalTextData
  private _currentTextGroups: SourceLayerText[]
  private _currentMatches: CurrentMatch[]
  private _sourceLayerTextGroups: WeakMap<SourceLayerText[], AdditionalTextDataText>

  constructor(additionalTextData: AdditionalTextData) {
    this._originalAdditionalTextData = additionalTextData
    this._additionalTextDataWithOctopusSpecialCharacters = this._initAdditionalTextData(
      AdditionalTextDataParser.ADDITIONAL_TEXT_DATA_DICTIONARY
    )
    this._additionalTextData = this._initAdditionalTextData(AdditionalTextDataParser.OCTOPUS_DICTIONARY)
    this._currentMatches = []
    this._currentTextGroups = []
    this._sourceLayerTextGroups = new WeakMap()
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

  private _setCurrentMatches() {
    return this._additionalTextData.texts
      .map((text) => ({ ...text, remainder: text.content }))
      .filter((text) => typeof text.content === 'string') as CurrentMatch[]
  }

  private _initAdditionalTextData(dictionary: Record<string, string>): AdditionalTextData {
    const originalAdditionalTextData = this._originalAdditionalTextData

    return {
      ...originalAdditionalTextData,
      texts: originalAdditionalTextData.texts.map((text) => {
        const content = text.content
        return {
          ...text,
          content: content ? this._replaceAllSpecialCharacters(content, dictionary) : content,
        }
      }),
    }
  }

  private _setTextGroup(sourceLayerText: SourceLayerText): void {
    if (this._currentMatches.length === 0) {
      this._currentMatches = this._setCurrentMatches()
    }

    this._currentMatches = this._getRemainingTextMatches(sourceLayerText.textValue)
    this._currentTextGroups.push(sourceLayerText)
  }

  private _getOctopusAdditionalTextDataText(index: number): AdditionalTextDataText {
    return this._additionalTextDataWithOctopusSpecialCharacters.texts.filter((text) => text.index === index)[0]
  }

  private _drainTextGroups(): SourceLayerText[] {
    const sourceTexts = [...this._currentTextGroups]
    const bestMatch = this._getBestMatch()

    if (bestMatch && typeof bestMatch.index === 'number') {
      this._eliminateMatchFromAdditionalTextData(bestMatch)
      this._sourceLayerTextGroups.set(sourceTexts, this._getOctopusAdditionalTextDataText(bestMatch.index))
    }

    this._currentTextGroups = []
    this._currentMatches = []
    return sourceTexts
  }

  private _eliminateMatchFromAdditionalTextData(bestMatch: Nullable<CurrentMatch>): void {
    if (!bestMatch) {
      return
    }

    this._additionalTextData = {
      ...this._additionalTextData,
      texts: this._additionalTextData.texts.filter((text) => text.index !== bestMatch.index),
    }
  }

  getOctopusText(sourceLayerTextGroup: SourceLayerText[]): Nullable<AdditionalTextDataText> {
    return this._sourceLayerTextGroups.get(sourceLayerTextGroup)
  }

  getTextGrouping(sourceLayerText: SourceLayerText, nextSourceLayer?: SourceLayer): SourceLayerText[] | false {
    this._setTextGroup(sourceLayerText)

    if (!this._isLastLayer(nextSourceLayer)) {
      console.error('___not last')
      return false
    }

    return this._drainTextGroups()
  }

  private _getRemainingTextMatches(octopusText: string): CurrentMatch[] {
    const octopusStringLenghts: number[] = []

    const currentMatches = this._currentMatches.filter(({ remainder }) => {
      if (remainder.indexOf(octopusText) === 0) {
        octopusStringLenghts.push(octopusText.length)

        return true
      }

      if (remainder.indexOf(removeTrailingHyphen(octopusText)) === 0) {
        octopusStringLenghts.push(octopusText.length - 1)
        return true
      }

      return false
    })

    if (currentMatches.length === 0) {
      return []
    }

    return currentMatches.map((match, index) => ({
      ...match,
      remainder: match.remainder.slice(octopusStringLenghts[index]),
    }))
  }

  private _isLastLayer(nextSourceLayer?: SourceLayer): boolean {
    if (!nextSourceLayer) {
      return true
    }

    if (nextSourceLayer.type !== AdditionalTextDataParser.TEXT_LAYER) {
      return true
    }

    return this._getRemainingTextMatches((nextSourceLayer as SourceLayerText).textValue).length === 0
  }

  private _getBestMatch(): Nullable<CurrentMatch> {
    if (!this._currentMatches.length) {
      return null
    }

    let bestMatch = { ...this._currentMatches[0] }

    for (let i = 0; i < this._currentMatches.length; i += 1) {
      const match = this._currentMatches[i]
      if (match.remainder.length < bestMatch.remainder.length) {
        bestMatch = match
      }
    }

    bestMatch = {
      ...bestMatch,
      content: this._additionalTextData.texts.filter((text) => text.index === bestMatch.index)[0].content,
    }

    return bestMatch
  }
}
