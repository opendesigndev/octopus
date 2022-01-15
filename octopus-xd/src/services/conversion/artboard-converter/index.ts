import OctopusArtboard from '../../../entities-octopus/octopus-artboard'

import type OctopusXDConverter from '../../..'
import type SourceDesign from '../../../entities-source/source-design'


export type ArtboardConversionOptions = {
  targetArtboardId: string,
  sourceDesign: SourceDesign
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusXdConverter: OctopusXDConverter
}

export default class ArtboardConverter {
  private _sourceDesign: SourceDesign
  private _targetArtboardId: string
  private _octopusXdConverter: OctopusXDConverter

  constructor(options: ArtboardConverterOptions) {
    this._octopusXdConverter = options.octopusXdConverter
    this._sourceDesign = options.sourceDesign
    this._targetArtboardId = options.targetArtboardId
  }

  convert() {
    return new OctopusArtboard({
      sourceDesign: this._sourceDesign,
      octopusXdConverter: this._octopusXdConverter,
      targetArtboardId: this._targetArtboardId
    }).convert()
  }
}