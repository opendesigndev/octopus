import type { OctopusPSDConverter } from '../..'
import { OctopusArtboard } from '../../entities/octopus/octopus-artboard'
import type { SourceArtboard } from '../../entities/source/source-artboard'

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

  convert() {
    return new OctopusArtboard({
      sourceArtboard: this._sourceArtboard,
      octopusConverter: this._octopusConverter,
    }).convert()
  }
}
