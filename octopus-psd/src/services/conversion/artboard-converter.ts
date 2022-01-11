import { OctopusPSDConverter } from '../..'
import { OctopusArtboard } from '../../entities/octopus-artboard'
import { SourceArtboard } from '../../entities/source-artboard'

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
