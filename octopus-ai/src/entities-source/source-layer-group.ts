import SourceLayerCommon from './source-layer-common'
import { RawGroupLayer, RawLayer } from '../typings/source'
import { SourceLayerParent } from './source-layer-common'
import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { createSourceLayer, SourceLayer } from '../factories/create-source-layer'
import SourceArtboard from './source-artboard'

type SourceLayerGroupOptions = {
  parent: SourceLayerParent
  rawValue: RawGroupLayer
  path: number[]
}

export default class SourceLayerGroup extends SourceLayerCommon {
  public _rawValue: RawGroupLayer
  private _children: SourceLayer[]

  constructor(options: SourceLayerGroupOptions) {
    super(options)
    this._rawValue = options.rawValue
    this._children = this._initChildren()
  }

  private _initChildren() {
    const children = asArray(this._rawValue?.Kids)
    return children.reduce((children: SourceLayer[], layer: RawLayer, i: number) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this,
        path: this.path.concat(i),
      })
      return sourceLayer ? [...children, sourceLayer] : children
    }, [])
  }

  get children(): SourceLayer[] {
    return this._children
  }

  get name(): string {
    const DEFAULT_NAME = '<Group>'
    const propertiesId = this._rawValue.Properties

    if (!(this._parent instanceof SourceArtboard) || !propertiesId) {
      return DEFAULT_NAME
    }

    const name = this._parent.resources.getPropertiesById(propertiesId)?.Name

    return name || DEFAULT_NAME
  }
}
