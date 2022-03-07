import OctopusArtboard from '../../../entities/octopus/octopus-artboard'

import type { OctopusXDConverter } from '../../..'
import type { Octopus } from '../../../typings/octopus'

export type ArtboardConversionOptions = {
  targetArtboardId: string
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusXdConverter: OctopusXDConverter
}

export default class ArtboardConverter {
  private _targetArtboardId: string
  private _octopusXdConverter: OctopusXDConverter

  constructor(options: ArtboardConverterOptions) {
    this._octopusXdConverter = options.octopusXdConverter
    this._targetArtboardId = options.targetArtboardId
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    throw 1 /** @TODO handle by converted artboards */
    /** @TODO investigate why images are transient on failed artboards */
    return new OctopusArtboard({
      octopusXdConverter: this._octopusXdConverter,
      targetArtboardId: this._targetArtboardId,
    }).convert()
  }
}
