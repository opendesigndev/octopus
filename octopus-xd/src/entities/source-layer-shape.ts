import { RawShapeLayer } from '../typings/source'
import SourceArtboard from './source-artboard'
import SourceLayerGroup from './source-layer-group'


type SourceLayerShapeOptions = {
  parent: SourceArtboard | SourceLayerGroup,
  rawValue: RawShapeLayer
}

export default class SourceLayerShape {
  _rawValue: RawShapeLayer
  _parent: SourceArtboard | SourceLayerGroup

  constructor(options: SourceLayerShapeOptions) {
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  get type() {
    return this._rawValue.type || null
  }
}