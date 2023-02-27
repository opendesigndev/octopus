import { asArray, asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { push } from '@opendesign/octopus-common/dist/utils/common.js'

import { createSourceLayer } from '../../factories/create-source-layer.js'
import { getArtboardColor, getBoundsFor, isArtboard } from '../../utils/source.js'
import { SourceEntity } from './source-entity.js'

import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { RawComponent, RawLayer } from '../../typings/raw/index.js'
import type { SourceBounds, SourceColor } from '../../typings/source.js'

export type SourceComponentOptions = {
  raw: RawComponent & RawLayer
  isPasteboard?: boolean
}

export class SourceComponent extends SourceEntity {
  declare _rawValue: RawComponent & RawLayer
  private _layers: SourceLayer[]
  private _isPasteboard: boolean

  static DEFAULT_ID = 'pasteboard-1'
  static DEFAULT_NAME = 'Pasteboard'

  constructor({ raw, isPasteboard }: SourceComponentOptions) {
    super(raw)
    this._layers = this._initLayers()
    this._isPasteboard = isPasteboard ?? false
  }

  private _initLayers() {
    const layers = asArray(this._rawValue?.layers).reduce((layers: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({ layer, parent: this })
      return sourceLayer ? push(layers, sourceLayer) : layers
    }, [])
    return layers
  }

  get raw(): RawComponent & RawLayer {
    return this._rawValue
  }

  get layers(): SourceLayer[] {
    return this._layers
  }

  get bounds(): SourceBounds {
    const artboardRect = this._rawValue.artboard?.artboardRect
    return artboardRect ? getBoundsFor(artboardRect) : getBoundsFor(this._rawValue.bounds)
  }

  get id(): string {
    return this._rawValue.id !== undefined ? String(this._rawValue.id) : SourceComponent.DEFAULT_ID
  }

  get name(): string {
    return this._rawValue.name !== undefined ? String(this._rawValue.name) : SourceComponent.DEFAULT_NAME
  }

  get isPasteboard(): boolean {
    return this._isPasteboard
  }

  get isArtboard(): boolean {
    return isArtboard(this._rawValue)
  }

  get artboardColor(): SourceColor | null {
    return getArtboardColor(this._rawValue)
  }

  get resolution(): number | undefined {
    return this._rawValue.resolution
  }

  get globalLightAngle(): number {
    return asFiniteNumber(this._rawValue.globalLight?.angle, 0)
  }
}
