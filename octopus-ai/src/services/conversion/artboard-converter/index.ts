import OctopusArtboard from '../../../entities/octopus/octopus-artboard'

import type { Octopus } from '../../../typings/octopus'
import type { OctopusAIConverter } from '../../..'
import type AdditionalTextDataParser from '../additional-text-data-parser'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

export type ArtboardConversionOptions = {
  targetArtboardId: string
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusAIConverter: OctopusAIConverter
  additionalTextDataParser: Nullable<AdditionalTextDataParser>
}

export default class ArtboardConverter {
  private _targetArtboardId: string
  private _octopusAIConverter: OctopusAIConverter
  private _additionalTextDataParser: Nullable<AdditionalTextDataParser>

  constructor(options: ArtboardConverterOptions) {
    this._octopusAIConverter = options.octopusAIConverter
    this._targetArtboardId = options.targetArtboardId
    this._additionalTextDataParser = options.additionalTextDataParser
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusArtboard({
      octopusAIConverter: this._octopusAIConverter,
      targetArtboardId: this._targetArtboardId,
      additionalTextDataParser: this._additionalTextDataParser,
    }).convert()
  }
}
