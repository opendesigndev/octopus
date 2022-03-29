import OctopusArtboard from '../../../entities/octopus/octopus-artboard'

import type { Octopus } from '../../../typings/octopus'
import type { OctopusAIConverter } from '../../..'
import type SourceLayerGroupingService from '../source-layer-grouping-service'

export type ArtboardConversionOptions = {
  targetArtboardId: string
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusAIConverter: OctopusAIConverter
  sourceLayerGroupingService: SourceLayerGroupingService
}

export default class ArtboardConverter {
  private _targetArtboardId: string
  private _octopusAIConverter: OctopusAIConverter
  private _sourceLayerGroupingService: SourceLayerGroupingService

  constructor(options: ArtboardConverterOptions) {
    this._octopusAIConverter = options.octopusAIConverter
    this._targetArtboardId = options.targetArtboardId
    this._sourceLayerGroupingService = options.sourceLayerGroupingService
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusArtboard({
      octopusAIConverter: this._octopusAIConverter,
      targetArtboardId: this._targetArtboardId,
      sourceLayerGroupingService: this._sourceLayerGroupingService,
    }).convert()
  }
}
