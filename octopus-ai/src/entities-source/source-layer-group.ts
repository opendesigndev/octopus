import { asArray } from '@avocode/octopus-common/dist/utils/as'

import SourceLayerCommon from './source-layer-common'
import { createSourceLayer } from '../factories/create-source-layer'
import SourceArtboard from './source-artboard'

import type { SourceLayer } from '../factories/create-source-layer'
import type { RawGroupLayer, RawLayer } from '../typings/source'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerGroupOptions = {
  parent: SourceLayerParent
  rawValue: RawGroupLayer
  path: number[]
}

export default class SourceLayerGroup extends SourceLayerCommon {
  static DEFAULT_NAME = '<Group>'

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
        path: [...this.path, i],
      })
      return sourceLayer ? [...children, sourceLayer] : children
    }, [])
  }

  get children(): SourceLayer[] {
    return this._children
  }

  get name(): string {
    const propertiesId = this._rawValue.Properties

    if (!(this._parent instanceof SourceArtboard) || !propertiesId) {
      return SourceLayerGroup.DEFAULT_NAME
    }

    const name = this._parent.resources.getPropertiesById(propertiesId)?.Name

    return name ?? SourceLayerGroup.DEFAULT_NAME
  }
}
