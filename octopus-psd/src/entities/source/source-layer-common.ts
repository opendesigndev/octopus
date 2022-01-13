import { RawLayer } from '../../typings/source'
import { SourceArtboard } from './source-artboard'
import { SourceLayerSection } from './source-layer-section'

export type SourceLayerParent = SourceArtboard | SourceLayerSection

export class SourceLayerCommon {
  _rawValue: RawLayer
  _parent: SourceLayerParent

  get type() {
    return this._rawValue.type
  }

  get id() {
    return this._rawValue.id ? this._rawValue.id.toString() : undefined
  }

  get name() {
    return this._rawValue.name
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
