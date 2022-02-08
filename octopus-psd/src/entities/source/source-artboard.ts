import type { RawArtboard, RawLayer } from '../../typings/source'
import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { createSourceLayer, SourceLayer } from '../../factories/create-source-layer'
import type { OctopusPSDConverter } from '../..'
import { getBoundsFor } from './utils'

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
    return getBoundsFor(this._rawValue.bounds)
  }

  get dimensions() {
    const { left, right, top, bottom } = this.bounds
    const width = right - left
    const height = bottom - top
    return { width, height }
  }
}
