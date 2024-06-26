import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'
import { push } from '@opendesign/octopus-common/dist/utils/common.js'

import { SourceLayerCommon } from './source-layer-common.js'
import { createSourceLayer } from '../../factories/create-source-layer.js'
import PROPS from '../../utils/prop-names.js'
import { getBoundsFor } from '../../utils/source.js'

import type { SourceLayerParent } from './source-layer-common.js'
import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { RawNodeChildWithType, RawLayerSection } from '../../typings/raw/index.js'
import type { SourceBounds } from '../../typings/source.js'

type SourceLayerSectionOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerSection
}

export class SourceLayerSection extends SourceLayerCommon {
  declare _rawValue: RawLayerSection
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
        layer: layer as unknown as RawNodeChildWithType,
      })
      return sourceLayer ? push(layers, sourceLayer) : layers
    }, [])
  }

  get bounds(): SourceBounds {
    const artboardRect = this._rawValue?.layerProperties?.[PROPS.ARTBOARD_DATA]?.artboardRect

    return artboardRect ? getBoundsFor(artboardRect) : this._parent.bounds
  }

  get layers(): SourceLayer[] {
    return this._layers
  }
}
