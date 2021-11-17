import OctopusXDConverter from '../../..'
import OctopusArtboard from '../../../entities/octopus-artboard'
import SourceDesign from '../../../entities/source-design'

export type ArtboardConversionOptions = {
  targetArtboardId: string,
  sourceDesign: SourceDesign
}

export type ArtboardConverterOptions = ArtboardConversionOptions & {
  octopusXdConverter: OctopusXDConverter
}


export default class ArtboardConverter {
  _sourceDesign: SourceDesign
  _targetArtboardId: string
  _octopusXdConverter: OctopusXDConverter

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