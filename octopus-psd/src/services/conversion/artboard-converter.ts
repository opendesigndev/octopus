import { OctopusArtboard } from '../../entities/octopus/octopus-artboard.js'

import type { OctopusPSDConverter } from '../../index.js'
import type { SourceDesign } from '../../entities/source/source-design.js'
import type { Octopus } from '../../typings/octopus.js'

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
