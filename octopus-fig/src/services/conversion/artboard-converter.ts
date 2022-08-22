import { OctopusArtboard } from '../../entities/octopus/octopus-artboard'

import type { SourceArtboard } from '../../entities/source/source-artboard'
import type { Octopus } from '../../typings/octopus'

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
    const artboard = new OctopusArtboard({
      sourceArtboard: this._sourceArtboard,
      version: this._version,
    })

    return artboard.convert()
  }
}
