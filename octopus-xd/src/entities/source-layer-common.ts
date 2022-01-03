import { RawLayer } from '../typings/source'
import SourceArtboard from './source-artboard'
import SourceLayerGroup from './source-layer-group'
import SourceLayerShape from './source-layer-shape'


export type SourceLayerParent = SourceArtboard | SourceLayerGroup | SourceLayerShape

export default class SourceLayerCommon {
  _rawValue: RawLayer
  _parent: SourceLayerParent

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