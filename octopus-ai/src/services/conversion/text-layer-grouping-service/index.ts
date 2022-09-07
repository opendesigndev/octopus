import { removeTrailingHyphen } from '../../../utils/text'

import type { SourceLayerText } from '../../../entities/source/source-layer-text'
import type { SourceLayer } from '../../../factories/create-source-layer'
import type { AdditionalTextData, AdditionalTextDataText } from '../../../typings/raw'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

type CurrentMatch = AdditionalTextDataText & {
  remainder: string
}

export type LayerSequence = {
  sourceLayers: SourceLayer[]
  additionalTextDataText?: AdditionalTextDataText
}

export class TextLayerGroupingservice {
  private _originalAdditionalTextData: AdditionalTextData

  /** @_additionalTextDataWithOctopusSpecialCharacters is used to replace text in merged text layers.
   * Resulting Octopus has its own special characters for endline and double endline.
   * SourceLayerText textValue does not have these special characters.
   */
  private _additionalTextDataWithOctopusSpecialCharacters: AdditionalTextData

  /** @_additionalTextData field is original  additionalTextData cleaned from special characters as input @SourceLayerText
   * textValue has no special characters. We then match SourceLayerText textValue against this input field.
   */
  private _additionalTextData: AdditionalTextData

  /** @_currentMatches field contains matches against incoming block of text with @remainder field
   * which indicates remaining text to be matched. Matched text is sliced out from the @remainder field.
   */
  private _currentMatches: Nullish<CurrentMatch[]>

  /** @_layerSequences is result of whole procedure as we need coherent sequence of SourceLayerText which will
   * form 1 OctopusTextLayer. For other layers than SourceLayerText, is only 1 layer in the sequence.
   */
  private _layerSequences: LayerSequence[] = []

  /** @_lastTextLayerSequence if sequence of SourceTextLayers together with @AditionalTextDataText. We keep this reference
   * so that we can either push next SourceTextLayer into sequence or start new sequence if next SourceTextLayer is not part
   * of the sequence
   */
  private _lastTextLayerSequence: Nullish<LayerSequence>

  static END_LINE = '\r'
  static DOUBLE_END_LINE = '\r\r'
  static END_LINE_OCTOPUS = '\n'
  static DOUBLE_END_LINE_OCTOPUS = '\u2029'

  static OCTOPUS_DICTIONARY = {
    [TextLayerGroupingservice.END_LINE]: TextLayerGroupingservice.END_LINE_OCTOPUS,
    [TextLayerGroupingservice.DOUBLE_END_LINE]: TextLayerGroupingservice.DOUBLE_END_LINE_OCTOPUS,
  }
  static ADDITIONAL_TEXT_DATA_DICTIONARY = {
    [TextLayerGroupingservice.END_LINE]: '',
    [TextLayerGroupingservice.DOUBLE_END_LINE]: '',
  }

  static SPECIAL_CHARACTERS = Object.keys(TextLayerGroupingservice.ADDITIONAL_TEXT_DATA_DICTIONARY).sort(
    (a, b) => b.length - a.length
  )
  static TEXT_LAYER = 'TextGroup'
  static MIN_HEIGHT_DIFFERENCE = 0.1
  static OCTOPUS_EXTRA_CHARACTERS = [
    TextLayerGroupingservice.END_LINE_OCTOPUS,
    TextLayerGroupingservice.DOUBLE_END_LINE_OCTOPUS,
  ]

  constructor(additionalTextData: AdditionalTextData) {
    this._originalAdditionalTextData = { ...additionalTextData }
    this._additionalTextDataWithOctopusSpecialCharacters = this._initAdditionalTextData(
      TextLayerGroupingservice.OCTOPUS_DICTIONARY
    )
    this._additionalTextData = this._initAdditionalTextData(TextLayerGroupingservice.ADDITIONAL_TEXT_DATA_DICTIONARY)
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
      TextLayers: originalAdditionalTextData?.TextLayers?.map((text: AdditionalTextDataText) => {
        const content = text.content

        return {
          ...text,
          content: content ? this._replaceAllSpecialCharacters(content, dictionary) : content,
        }
      }),
    }
  }

  /** @_getRemainingTextMatches  selects all matches which have remainder field starting with
   * SourceLayerText.textValue and cuts out matching text from the remainder. Sliced out text lenghts
   * can differ due to trailing hyphens which are not present in AdditionalTextData but can be present in
   * original text.
   */
  private _getRemainingTextMatches(sourceLayerText: SourceLayerText): Nullish<CurrentMatch[]> {
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

  /** @_setCurrentMatches sets current matches with already text from incoming @SourceLayerText  already
   * sliced out.
   */
  private _setCurrentMatches(sourceLayerText: SourceLayerText) {
    const texts = this._additionalTextData?.TextLayers

    if (!texts) {
      return
    }

    this._currentMatches = texts
      .map((text: AdditionalTextDataText) => ({ ...text, remainder: text.content }))
      .filter((text: AdditionalTextDataText) => typeof text.content === 'string') as CurrentMatch[]

    this._currentMatches = this._getRemainingTextMatches(sourceLayerText)
  }

  /** Whenever we find and use best match in AdditionalTextData, we need to remove it so it does not
   * get used again. All source texts should be covered by AdditionalTextData once and only once.
   */
  private _eliminateMatchFromAdditionalTextData(bestMatch: Nullish<CurrentMatch>): void {
    if (!bestMatch) {
      return
    }

    this._additionalTextData = {
      ...this._additionalTextData,
      TextLayers:
        this._additionalTextData?.TextLayers?.filter(
          (text: AdditionalTextDataText) => text.index !== bestMatch.index
        ) ?? [],
    }
  }

  /** @_isSourceLayerPartOfLastTextSequence determines if we should start new layerSequence by comparing the
   * incoming sourceLayerText textvalue to remainders of previous LayerSequence.
   */
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

  /** @_getBestMatch finds best match according to shortest remainder criteria.
   * AdditionalTextData can have texts which are longer than input text as some of the texts are hidden,
   * but we need to put in all text from additonalTextData into octopus.
   */
  private _getBestMatch(): Nullish<CurrentMatch> {
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

    const content = this._additionalTextData?.TextLayers?.filter(
      (text: AdditionalTextDataText) => text.index === bestMatch.index
    )[0]?.content

    bestMatch = {
      ...bestMatch,
      content: content ?? '',
    }

    return bestMatch
  }

  /**  AdditionalTextData can have texts which are longer than input text as some of the texts are hidden,
   * but we need to put in all text from additonalTextData into Octopus. Therefore we copy the best match into
   * LayerSequence so it can be used whole (even the text which is not is SourceLayerText)
   */
  private _addBestMatchToLastTextLayerSequence(): void {
    const bestMatch = this._getBestMatch()
    const lastTextLayerSequence = this._lastTextLayerSequence

    if (bestMatch && typeof bestMatch.index === 'number' && lastTextLayerSequence) {
      this._eliminateMatchFromAdditionalTextData(bestMatch)
      const lastTextLayerSequenceText = this._additionalTextDataWithOctopusSpecialCharacters.TextLayers?.find(
        (additionalText: AdditionalTextDataText) => additionalText.index === bestMatch.index
      )

      lastTextLayerSequence.additionalTextDataText = lastTextLayerSequenceText
        ? { ...lastTextLayerSequenceText }
        : lastTextLayerSequenceText
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
      if (sourceLayer.type !== TextLayerGroupingservice.TEXT_LAYER || !this._originalAdditionalTextData) {
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
