import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import { createSourceLayer } from '../../factories/create-source-layer'
import { SourceLayerCommon } from './source-layer-common'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawLayer, RawLayerFrame } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerFrameOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerFrame
}

export class SourceLayerFrame extends SourceLayerCommon {
  protected _rawValue: RawLayerFrame
  private _layers: SourceLayer[]

  constructor(options: SourceLayerFrameOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  private _initLayers() {
    const layers = asArray(this._rawValue?.children)
    return layers.reduce((layers: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({ layer, parent: this })
      return sourceLayer ? push(layers, sourceLayer) : layers
    }, [])
  }

  get type(): 'FRAME' {
    return 'FRAME'
  }

  // TODO
  // get bounds(): SourceBounds {
  //   return this.isArtboard ? getBoundsFor(this._rawValue.artboard?.artboardRect) : this._parent.bounds
  // }

  get layers(): SourceLayer[] {
    return this._layers
  }
}
