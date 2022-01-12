import { RawLayer, RawLayerSection } from '../../typings/source'
import { createSourceLayer, SourceLayer } from '../../factories/create-source-layer'
import { asArray } from '../../utils/as'
import { SourceLayerCommon, SourceLayerParent } from './source-layer-common'

type SourceLayerSectionOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerSection
}

export class SourceLayerSection extends SourceLayerCommon {
  _rawValue: RawLayerSection
  _parent: SourceLayerParent
  _layers: SourceLayer[]

  constructor(options: SourceLayerSectionOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
    this._layers = this._initLayers()
  }

  _initLayers() {
    const layers = asArray(this._rawValue?.layers)
    return layers.reduce((layers: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this,
      })
      return sourceLayer ? [...layers, sourceLayer] : layers
    }, [])
  }

  get layers() {
    return this._layers
  }
}
