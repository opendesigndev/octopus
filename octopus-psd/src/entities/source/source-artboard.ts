import { asArray, asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import { createSourceLayer, SourceLayer } from '../../factories/create-source-layer'
import type { RawArtboard, RawLayer } from '../../typings/raw'
import { SourceBounds } from '../../typings/source'
import { getBoundsFor } from '../../utils/source'

export type SourceArtboardOptions = {
  rawValue: RawArtboard
}

export class SourceArtboard {
  private _rawValue: RawArtboard
  private _layers: SourceLayer[]

  static DEFAULT_ID = '1'

  constructor(options: SourceArtboardOptions) {
    this._rawValue = options.rawValue
    this._layers = this._initLayers()
  }

  private _initLayers() {
    const layers = asArray(this._rawValue?.layers).reduce((layers: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this,
      })
      return sourceLayer ? push(layers, sourceLayer) : layers
    }, [])
    return layers
  }

  get raw(): RawArtboard {
    return this._rawValue
  }

  get layers(): SourceLayer[] {
    return this._layers
  }

  get bounds(): SourceBounds {
    return getBoundsFor(this._rawValue.bounds)
  }

  get id(): string {
    return SourceArtboard.DEFAULT_ID
  }

  get resolution(): number | undefined {
    return this._rawValue.resolution
  }

  get globalLightAngle(): number {
    return asFiniteNumber(this._rawValue.globalLight?.angle, 0)
  }
}
