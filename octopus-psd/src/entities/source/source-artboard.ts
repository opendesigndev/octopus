import { RawArtboard, RawLayer } from '../../typings/source'
import { asArray } from '../../utils/as'
// import { createSourceLayer, SourceLayer } from '../../factories/create-source-layer'

export type SourceArtboardOptions = {
  rawValue: RawArtboard
}

export class SourceArtboard {
  _rawValue: RawArtboard
  //   _layers: SourceLayer[]

  constructor(options: SourceArtboardOptions) {
    this._rawValue = options.rawValue
    // this._layers = this._initLayers()
  }

  //   _initLayers() {
  //     const layers = asArray(this._rawValue?.layers)
  //     return layers.reduce((layers: SourceLayer[], layer: RawLayer) => {
  //       const sourceLayer = createSourceLayer({
  //         layer,
  //         parent: this,
  //       })
  //       return sourceLayer ? [...layers, sourceLayer] : layers
  //     }, [])
  //   }

  //   get layers() {
  //     return this._layers
  //   }

  get bounds() {
    return {
      right: this._rawValue.bounds?.right ?? 0,
      left: this._rawValue.bounds?.left ?? 0,
      bottom: this._rawValue.bounds?.bottom ?? 0,
      top: this._rawValue.bounds?.top ?? 0,
    }
  }
}
