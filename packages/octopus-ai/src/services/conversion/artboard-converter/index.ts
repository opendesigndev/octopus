import { OctopusArtboard } from '../../../entities/octopus/octopus-artboard.js'

import type { Octopus } from '../../../typings/octopus/index.js'
import type { DesignConverter } from '../design-converter/index.js'

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

  convert(): Octopus['OctopusComponent'] {
    return new OctopusArtboard({
      designConverter: this._designConverter,
      targetArtboardId: this._targetArtboardId,
    }).convert()
  }
}
