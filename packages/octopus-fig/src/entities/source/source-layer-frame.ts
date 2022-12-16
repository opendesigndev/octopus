import { asArray } from '@opendesign/octopus-common/dist/utils/as'
import { push } from '@opendesign/octopus-common/dist/utils/common'

import { createSourceLayer } from '../../factories/create-source-layer'
import { getBoundsFor } from '../../utils/source'
import { SourceLayerCommon } from './source-layer-common'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawLayer, RawLayerFrame } from '../../typings/raw'
import type { SourceBounds } from '../../typings/source'
import type { FrameTypes, SourceLayerParent } from './source-layer-common'

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
