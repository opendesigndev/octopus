import { OctopusArtboard } from '../../entities/octopus/octopus-artboard.js'

import type { SourceArtboard } from '../../entities/source/source-artboard.js'
import type { Octopus } from '../../typings/octopus.js'

export type ArtboardConverterOptions = {
  artboard: SourceArtboard
  version: string
}

export class ArtboardConverter {
  private _sourceArtboard: SourceArtboard
  private _version: string

  constructor(options: ArtboardConverterOptions) {
    this._sourceArtboard = options.artboard
    this._version = options.version
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusArtboard({
      sourceArtboard: this._sourceArtboard,
      version: this._version,
    }).convert()
  }
}
