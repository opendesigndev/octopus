import { RawGroupLayer, RawLayer } from '../typings/source'
import SourceArtboard from './source-artboard'
import { createSourceLayer, SourceLayer } from '../factories/source-layer'
import { asArray } from '../utils/as'


type SourceLayerGroupOptions = {
  parent: SourceArtboard | SourceLayerGroup,
  rawValue: RawGroupLayer
}

export default class SourceLayerGroup {
  _rawValue: RawGroupLayer
  _parent: SourceArtboard | SourceLayerGroup
  _children: SourceLayer[]

  constructor(options: SourceLayerGroupOptions) {
    this._parent = options.parent
    this._rawValue = options.rawValue
    this._children = this._initChildren()
  }

  _initChildren() {
    const children = asArray(this._rawValue?.group?.children)
    return children.reduce((children: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this
      })
      return sourceLayer ? [ ...children, sourceLayer ] : children
    }, [])
  }

  get type() {
    return this._rawValue.type || null
  }

  get children() {
    return this._children
  }
}