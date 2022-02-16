import OctopusArtboard from '../../../entities-octopus/octopus-artboard'

import type OctopusAIConverter from '../../..'
import type SourceDesign from '../../../entities-source/source-design'


export type ArtboardConversionOptions = {
  targetArtboardId: string,
  sourceDesign: SourceDesign
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusAIConverter: OctopusAIConverter
}

export default class ArtboardConverter {
  private _sourceDesign: SourceDesign
  private _targetArtboardId: string
  private _octopusAIConverter: OctopusAIConverter

  constructor(options: ArtboardConverterOptions) {
    this._octopusAIConverter = options.octopusAIConverter
    this._sourceDesign = options.sourceDesign
    this._targetArtboardId = options.targetArtboardId
  }

  convert() {
    return new OctopusArtboard({
      sourceDesign: this._sourceDesign,
      octopusAIConverter: this._octopusAIConverter,
      targetArtboardId: this._targetArtboardId
    }).convert()
  }
}