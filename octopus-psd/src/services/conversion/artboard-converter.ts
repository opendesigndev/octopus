import { OctopusArtboard } from '../../entities/octopus/octopus-artboard'

import type { OctopusPSDConverter } from '../..'
import type { SourceDesign } from '../../entities/source/source-design'
import type { Octopus } from '../../typings/octopus'

export type ArtboardConverterOptions = {
  octopusConverter: OctopusPSDConverter
}

export class ArtboardConverter {
  _sourceDesign: SourceDesign
  _octopusConverter: OctopusPSDConverter

  constructor(options: ArtboardConverterOptions) {
    this._octopusConverter = options.octopusConverter
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusArtboard({ octopusConverter: this._octopusConverter }).convert()
  }
}
