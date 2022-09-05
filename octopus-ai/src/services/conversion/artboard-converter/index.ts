import { OctopusArtboard } from '../../../entities/octopus/octopus-artboard'
import { OctopusLayerMaskGroup } from '../../../entities/octopus/octopus-layer-mask-group'

import type { OctopusAIConverter } from '../../..'
import type { Octopus } from '../../../typings/octopus'

export type ArtboardConversionOptions = {
  targetArtboardId: string
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusAIConverter: OctopusAIConverter
}

export class ArtboardConverter {
  private _targetArtboardId: string
  private _octopusAIConverter: OctopusAIConverter

  constructor(options: ArtboardConverterOptions) {
    this._octopusAIConverter = options.octopusAIConverter
    this._targetArtboardId = options.targetArtboardId
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    OctopusLayerMaskGroup.resetRegistry()

    return new OctopusArtboard({
      octopusAIConverter: this._octopusAIConverter,
      targetArtboardId: this._targetArtboardId,
    }).convert()
  }
}
