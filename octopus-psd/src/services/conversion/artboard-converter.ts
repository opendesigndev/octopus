import type { OctopusPSDConverter } from '../..'
import { OctopusArtboard } from '../../entities/octopus/octopus-artboard'
import type { SourceArtboard } from '../../entities/source/source-artboard'
import type { Octopus } from '../../typings/octopus'

export type ArtboardConversionOptions = {
  sourceArtboard: SourceArtboard
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusConverter: OctopusPSDConverter
}

export class ArtboardConverter {
  _sourceArtboard: SourceArtboard
  _octopusConverter: OctopusPSDConverter

  constructor(options: ArtboardConverterOptions) {
    this._octopusConverter = options.octopusConverter
    this._sourceArtboard = options.sourceArtboard
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusArtboard({
      sourceArtboard: this._sourceArtboard,
      octopusConverter: this._octopusConverter,
    }).convert()
  }
}
