import type { RawLayer, RawLayerSection } from '../../typings/source'
import { createSourceLayer, SourceLayer } from '../../factories/create-source-layer'
import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerSectionOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerSection
}

export class SourceLayerSection extends SourceLayerCommon {
  protected _rawValue: RawLayerSection
  protected _parent: SourceLayerParent
  private _layers: SourceLayer[]

  constructor(options: SourceLayerSectionOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
    this._layers = this._initLayers()
  }

  private _initLayers() {
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
