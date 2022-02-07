import type { OctopusPSDConverter } from '../..'
import type { RawLayer } from '../../typings/source'
import { SourceArtboard } from './source-artboard'
import type { SourceLayerSection } from './source-layer-section'
import { getBoundsFor } from './utils'

export type SourceLayerParent = SourceArtboard | SourceLayerSection

export class SourceLayerCommon {
  protected _rawValue: RawLayer
  protected _parent: SourceLayerParent

  get type() {
    return this._rawValue.type
  }

  get id() {
    return this._rawValue.id ? this._rawValue.id.toString() : undefined
  }

  get name() {
    return this._rawValue.name
  }

  get converter(): OctopusPSDConverter {
    const parentArtboard = this.parentArtboard
    return parentArtboard.converter
  }

  get parentArtboard(): SourceArtboard {
    const parent = this._parent
    return parent instanceof SourceArtboard ? parent : parent.parentArtboard
  }

  get visible() {
    return this._rawValue.visible
  }

  get bounds() {
    return getBoundsFor(this._rawValue.bounds)
  }

  get dimensions() {
    const { left, right, top, bottom } = this.bounds
    const width = right - left
    const height = bottom - top
    return { width, height }
  }

  get opacity() {
    return this._rawValue.blendOptions?.opacity?.value
  }

  get blendMode() {
    return this._rawValue.blendOptions?.mode
  }

  get clipped() {
    return this._rawValue.clipped
  }

  get imageEffectsApplied() {
    return this._rawValue.imageEffectsApplied
  }

  get imageName() {
    return this._rawValue.imageName
  }
}
