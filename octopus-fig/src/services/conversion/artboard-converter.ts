import { OctopusArtboard } from '../../entities/octopus/octopus-artboard'

import type { OctopusFigConverter } from '../..'
import type { SourceDesign } from '../../entities/source/source-design'
import type { Octopus } from '../../typings/octopus'

export type ArtboardConversionOptions = {
  sourceDesign: SourceDesign
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusConverter: OctopusFigConverter
}

export class ArtboardConverter {
  _sourceDesign: SourceDesign
  _octopusConverter: OctopusFigConverter

  constructor(options: ArtboardConverterOptions) {
    this._octopusConverter = options.octopusConverter
    this._sourceDesign = options.sourceDesign
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusArtboard({
      sourceDesign: this._sourceDesign,
      octopusConverter: this._octopusConverter,
    }).convert()
  }
}
