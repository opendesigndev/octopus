import type { RawArtboard, RawLayer } from '../../typings/source'
import { asArray } from '../../utils/as'
import { createSourceLayer, SourceLayer } from '../../factories/create-source-layer'
import type { OctopusPSDConverter } from '../..'

export type SourceArtboardOptions = {
  rawValue: RawArtboard
  octopusConverter: OctopusPSDConverter
}

export class SourceArtboard {
  private _rawValue: RawArtboard
  private _octopusConverter: OctopusPSDConverter
  private _layers: SourceLayer[]

  constructor(options: SourceArtboardOptions) {
    this._rawValue = options.rawValue
    this._octopusConverter = options.octopusConverter
    this._layers = this._initLayers()
  }

  get converter() {
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

  get layers() {
    return this._layers
  }

  get bounds() {
    return {
      right: this._rawValue.bounds?.right ?? 0,
      left: this._rawValue.bounds?.left ?? 0,
      bottom: this._rawValue.bounds?.bottom ?? 0,
      top: this._rawValue.bounds?.top ?? 0,
    }
  }
}
