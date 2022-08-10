import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import { createSourceLayer } from '../../factories/create-source-layer.js'
import { getBoundsFor } from '../../utils/source.js'
import { SourceLayerCommon } from './source-layer-common.js'

import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { RawLayer, RawLayerSection } from '../../typings/raw/index.js'
import type { SourceBounds } from '../../typings/source.js'
import type { SourceLayerParent } from './source-layer-common.js'

type SourceLayerSectionOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerSection
}

export class SourceLayerSection extends SourceLayerCommon {
  protected _rawValue: RawLayerSection
  private _layers: SourceLayer[]

  constructor(options: SourceLayerSectionOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  private _initLayers() {
    const layers = asArray(this._rawValue?.layers)
    return layers.reduce((layers: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this,
      })
      return sourceLayer ? push(layers, sourceLayer) : layers
    }, [])
  }

  get bounds(): SourceBounds {
    return this.isArtboard ? getBoundsFor(this._rawValue.artboard?.artboardRect) : this._parent.bounds
  }

  get layers(): SourceLayer[] {
    return this._layers
  }
}
