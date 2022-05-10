import { OctopusArtboard } from '../../entities/octopus/octopus-artboard'

import type { OctopusFigConverter } from '../..'
import type { Octopus } from '../../typings/octopus'

export type ArtboardConversionOptions = {
  targetArtboardId: string
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusConverter: OctopusFigConverter
}

export class ArtboardConverter {
  private _targetArtboardId: string
  private _octopusConverter: OctopusFigConverter

  constructor(options: ArtboardConverterOptions) {
    this._octopusConverter = options.octopusConverter
    this._targetArtboardId = options.targetArtboardId
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusArtboard({
      octopusConverter: this._octopusConverter,
      targetArtboardId: this._targetArtboardId,
    }).convert()
  }
}
