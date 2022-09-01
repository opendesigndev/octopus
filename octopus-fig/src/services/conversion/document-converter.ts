import { OctopusArtboard } from '../../entities/octopus/octopus-artboard'

import type { SourceArtboard } from '../../entities/source/source-artboard'
import type { Octopus } from '../../typings/octopus'

export type DocumentConverterOptions = {
  source: SourceArtboard
  version: string
}

export class DocumentConverter {
  private _sourceArtboard: SourceArtboard
  private _version: string

  constructor(options: DocumentConverterOptions) {
    this._sourceArtboard = options.source
    this._version = options.version
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    const document = new OctopusArtboard({
      sourceArtboard: this._sourceArtboard,
      version: this._version,
    })

    return document.convert()
  }
}
