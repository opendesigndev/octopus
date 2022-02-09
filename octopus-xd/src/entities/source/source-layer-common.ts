import type { RawLayer } from '../../typings/source'
import type SourceArtboard from './source-artboard'
import type SourceLayerGroup from './source-layer-group'
import type SourceLayerShape from './source-layer-shape'


export type SourceLayerParent = 
  | SourceArtboard
  | SourceLayerGroup
  | SourceLayerShape

export default class SourceLayerCommon {
  protected _parent: SourceLayerParent
  protected _rawValue: RawLayer

  get transform() {
    return this._rawValue.transform
  }

  get type() {
    return this._rawValue.type
  }

  get id() {
    return this._rawValue.id
  }

  get name() {
    return this._rawValue.name
  }

  get visible() {
    return this._rawValue.visible
  }

  get blendMode() {
    return this._rawValue.style?.blendMode
  }

  get opacity() {
    return this._rawValue.style?.opacity
  }

  get fixed() {
    return this._rawValue.meta?.ux?.fixed
  }

  get style() {
    return this._rawValue.style
  }

  get raw() {
    return this._rawValue
  }
}