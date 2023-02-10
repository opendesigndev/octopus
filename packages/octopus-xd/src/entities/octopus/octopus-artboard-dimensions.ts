import { asNumber } from '@opendesign/octopus-common/utils/as'

import type { Octopus } from '../../typings/octopus'
import type { SourceArtboard } from '../source/source-artboard'

type OctopusDimensionsOptions = {
  sourceArtboard: SourceArtboard
}

export class OctopusArtboardDimensions {
  private _sourceArtboard: SourceArtboard

  constructor(options: OctopusDimensionsOptions) {
    this._sourceArtboard = options.sourceArtboard
  }

  get areValid(): boolean {
    return (
      typeof this._sourceArtboard.meta['uxdesign#bounds']?.width === 'number' &&
      typeof this._sourceArtboard.meta['uxdesign#bounds']?.height === 'number'
    )
  }

  get w(): number {
    return asNumber(this._sourceArtboard.meta['uxdesign#bounds']?.width, 0)
  }

  get h(): number {
    return asNumber(this._sourceArtboard.meta['uxdesign#bounds']?.height, 0)
  }

  convert(): Octopus['Dimensions'] {
    return {
      width: this.w,
      height: this.h,
    }
  }
}
