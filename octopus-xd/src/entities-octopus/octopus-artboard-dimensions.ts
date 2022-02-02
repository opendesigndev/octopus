import { asNumber } from '../utils/as'

import type SourceArtboard from '../entities-source/source-artboard'


type OctopusDimensionsOptions = {
  sourceArtboard: SourceArtboard
}

export default class OctopusArtboardDimensions {
  private _sourceArtboard: SourceArtboard

  constructor(options: OctopusDimensionsOptions) {
    this._sourceArtboard = options.sourceArtboard
  }

  convert() {
    return {
      width: asNumber(this._sourceArtboard.meta['uxdesign#bounds']?.width, 0),
      height: asNumber(this._sourceArtboard.meta['uxdesign#bounds']?.height, 0)
    }
  }
}
