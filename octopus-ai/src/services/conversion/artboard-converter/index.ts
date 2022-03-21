import OctopusArtboard from '../../../entities/octopus/octopus-artboard'

import type { Octopus } from '../../../typings/octopus'
import type { OctopusAIConverter } from '../../..'

export type ArtboardConversionOptions = {
  targetArtboardId: string
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusAIConverter: OctopusAIConverter
}

export default class ArtboardConverter {
  private _targetArtboardId: string
  private _octopusAIConverter: OctopusAIConverter

  constructor(options: ArtboardConverterOptions) {
    this._octopusAIConverter = options.octopusAIConverter
    this._targetArtboardId = options.targetArtboardId
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusArtboard({
      octopusAIConverter: this._octopusAIConverter,
      targetArtboardId: this._targetArtboardId,
    }).convert()
  }
}
