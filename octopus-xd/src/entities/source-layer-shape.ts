import { RawShapeLayer } from '../typings/source'
import SourceArtboard from './source-artboard'
import SourceLayerCommon from './source-layer-common'
import SourceLayerGroup from './source-layer-group'


type SourceLayerShapeOptions = {
  parent: SourceArtboard | SourceLayerGroup,
  rawValue: RawShapeLayer
}

export default class SourceLayerShape extends SourceLayerCommon {
  _rawValue: RawShapeLayer
  _parent: SourceArtboard | SourceLayerGroup

  constructor(options: SourceLayerShapeOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }
}
