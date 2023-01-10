import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'
import { push } from '@opendesign/octopus-common/dist/utils/common.js'

import { createSourceLayer } from '../../factories/create-source-layer.js'
import { getBoundsFor } from '../../utils/source.js'
import { SourceLayerCommon } from './source-layer-common.js'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { NodeChildWithType, RawLayerSection } from '../../typings/raw'
import type { SourceBounds } from '../../typings/source'
import type { SourceLayerParent } from './source-layer-common'

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
    const psdLayers = asArray(this._rawValue?.children)
    return psdLayers.reduce((layers: SourceLayer[], layer) => {
      const sourceLayer = createSourceLayer({
        parent: this,
        layer: layer as unknown as NodeChildWithType,
      })
      return sourceLayer ? push(layers, sourceLayer) : layers
    }, [])
  }

  get bounds(): SourceBounds {
    const artboardRect = this._rawValue?.layerProperties?.artb?.artboardRect

    return artboardRect ? getBoundsFor(artboardRect) : this._parent.bounds
  }

  get layers(): SourceLayer[] {
    return this._layers
  }
}
