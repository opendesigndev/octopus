import { asArray, asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import { createSourceLayer } from '../../factories/create-source-layer'
import { getBoundsFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawComponent, RawLayer } from '../../typings/raw'
import type { SourceBounds } from '../../typings/source'

export class SourceComponent extends SourceEntity {
  protected _rawValue: RawComponent
  private _layers: SourceLayer[]

  static DEFAULT_ID = 'component-1'

  constructor(raw: RawComponent) {
    super(raw)
    this._layers = this._initLayers()
  }

  private _initLayers() {
    const layers = asArray(this._rawValue?.layers).reduce((layers: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this,
      })
      return sourceLayer ? push(layers, sourceLayer) : layers
    }, [])
    return layers
  }

  get raw(): RawComponent {
    return this._rawValue
  }

  get layers(): SourceLayer[] {
    return this._layers
  }

  get bounds(): SourceBounds {
    return getBoundsFor(this._rawValue.bounds)
  }

  get id(): string {
    return SourceComponent.DEFAULT_ID
  }

  get resolution(): number | undefined {
    return this._rawValue.resolution
  }

  get globalLightAngle(): number {
    return asFiniteNumber(this._rawValue.globalLight?.angle, 0)
  }
}
