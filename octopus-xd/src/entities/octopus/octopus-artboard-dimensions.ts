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

  get areValid() {
    return typeof this._sourceArtboard.meta['uxdesign#bounds']?.width === 'number'
      && typeof this._sourceArtboard.meta['uxdesign#bounds']?.height === 'number'
  }

  get w() {
    return asNumber(this._sourceArtboard.meta['uxdesign#bounds']?.width, 0)
  }

  get h() {
    return asNumber(this._sourceArtboard.meta['uxdesign#bounds']?.height, 0)
  }

  convert() {
    return {
      width: this.w,
      height: this.h
    }
  }
}