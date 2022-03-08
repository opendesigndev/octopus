import type { RawArtboard, RawLayer } from '../../typings/raw'
import { asArray, asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { createSourceLayer, SourceLayer } from '../../factories/create-source-layer'
import type { OctopusPSDConverter } from '../..'
import { getBoundsFor } from '../../utils/source'
import { SourceBounds } from '../../typings/source'

export type SourceArtboardOptions = {
  rawValue: RawArtboard
  octopusConverter: OctopusPSDConverter
}

export class SourceArtboard {
  private _rawValue: RawArtboard
  private _octopusConverter: OctopusPSDConverter
  private _layers: SourceLayer[]

  static DEFAULT_ID = '1'

  constructor(options: SourceArtboardOptions) {
    this._rawValue = options.rawValue
    this._octopusConverter = options.octopusConverter
    this._layers = this._initLayers()
  }

  get converter(): OctopusPSDConverter {
    return this._octopusConverter
  }

  private _initLayers() {
    const layers = asArray(this._rawValue?.layers).reduce((layers: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this,
      })
      return sourceLayer ? [...layers, sourceLayer] : layers
    }, [])
    return layers
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
