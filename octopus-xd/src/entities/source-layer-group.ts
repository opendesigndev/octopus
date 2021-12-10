import { RawGroupLayer, RawLayer } from '../typings/source'
import { createSourceLayer, SourceLayer } from '../factories/create-source-layer'
import { asArray } from '../utils/as'
import SourceLayerCommon, { SourceLayerParent } from './source-layer-common'


type SourceLayerGroupOptions = {
  parent: SourceLayerParent,
  rawValue: RawGroupLayer
}

export default class SourceLayerGroup extends SourceLayerCommon {
  _rawValue: RawGroupLayer
  _parent: SourceLayerParent
  _children: SourceLayer[]

  constructor(options: SourceLayerGroupOptions) {
    super()
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

  get children() {
    return this._children
  }
}