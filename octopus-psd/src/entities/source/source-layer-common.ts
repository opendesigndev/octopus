import type { OctopusPSDConverter } from '../..'
import type { RawLayer } from '../../typings/source'
import { SourceArtboard } from './source-artboard'
import type { SourceLayerSection } from './source-layer-section'

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

  get converter(): OctopusPSDConverter | null {
    const parentArtboard = this.parentArtboard
    if (!parentArtboard) return null
    return parentArtboard.converter
  }

  get parentArtboard(): SourceArtboard | null {
    if (!this._parent) return null
    const parent = this._parent as SourceLayerParent
    return parent instanceof SourceArtboard ? parent : parent.parentArtboard
  }

  get visible() {
    return this._rawValue.visible
  }

  get bounds() {
    return this._rawValue.bounds
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
