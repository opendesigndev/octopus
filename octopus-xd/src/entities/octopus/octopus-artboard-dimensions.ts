import { asNumber } from '@avocode/octopus-common/dist/utils/as'

import type SourceArtboard from '../source/source-artboard'


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