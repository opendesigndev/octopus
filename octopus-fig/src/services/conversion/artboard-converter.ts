import { OctopusArtboard } from '../../entities/octopus/octopus-artboard'

import type { OctopusFigConverter } from '../..'
import type { Octopus } from '../../typings/octopus'

export type ArtboardConverterOptions = {
  targetArtboardId: string
  octopusConverter: OctopusFigConverter
}

export class ArtboardConverter {
  private _targetArtboardId: string
  private _octopusConverter: OctopusFigConverter

  constructor(options: ArtboardConverterOptions) {
    this._targetArtboardId = options.targetArtboardId
    this._octopusConverter = options.octopusConverter
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusArtboard({
      targetArtboardId: this._targetArtboardId,
      octopusConverter: this._octopusConverter,
    }).convert()
  }
}
