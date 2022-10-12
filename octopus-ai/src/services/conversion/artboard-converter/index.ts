import { OctopusArtboard } from '../../../entities/octopus/octopus-artboard'

import type { Octopus } from '../../../typings/octopus'
import type { DesignConverter } from '../design-converter'

export type ArtboardConversionOptions = {
  targetArtboardId: string
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  designConverter: DesignConverter
}

export class ArtboardConverter {
  private _targetArtboardId: string
  private _designConverter: DesignConverter

  constructor(options: ArtboardConverterOptions) {
    this._designConverter = options.designConverter
    this._targetArtboardId = options.targetArtboardId
  }

  convert(): Octopus['OctopusDocument'] {
    return new OctopusArtboard({
      designConverter: this._designConverter,
      targetArtboardId: this._targetArtboardId,
    }).convert()
  }
}
