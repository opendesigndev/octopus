import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'
import { push } from '@opendesign/octopus-common/dist/utils/common.js'

import { SourceLayerCommon } from './source-layer-common.js'
import { createSourceLayer } from '../../factories/create-source-layer.js'
import { getBoundsFor } from '../../utils/source.js'

import type { FrameTypes, SourceLayerParent } from './source-layer-common.js'
import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { RawLayer, RawLayerContainer } from '../../typings/raw/index.js'
import type { SourceBounds } from '../../typings/source.js'

type SourceLayerContainerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerContainer
}

export class SourceLayerContainer extends SourceLayerCommon {
  declare _rawValue: RawLayerContainer
  private _layers: SourceLayer[]

  constructor(options: SourceLayerContainerOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  private _initLayers() {
    return asArray(this._rawValue?.children).reduce((layers: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({ layer, parent: this })
      return sourceLayer ? push(layers, sourceLayer) : layers
    }, [])
  }

  get hasBackgroundMask(): boolean {
    const isFrameLike = ['FRAME', 'COMPONENT_SET', 'COMPONENT', 'INSTANCE'].includes(this.type)
    const hasFills = this.fills.length > 0
    const hasStrokes = this.strokes.length > 0
    return isFrameLike && (hasFills || hasStrokes)
  }

  get type(): FrameTypes {
    return this._rawValue.type ?? 'FRAME'
  }

  get clipsContent(): boolean {
    return this._rawValue.clipsContent ?? true
  }

  get layers(): SourceLayer[] {
    return this._layers
  }

  get bounds(): SourceBounds | null {
    return getBoundsFor(this._rawValue.absoluteRenderBounds)
  }

  get boundingBox(): SourceBounds | null {
    return getBoundsFor(this._rawValue.absoluteBoundingBox)
  }
}
