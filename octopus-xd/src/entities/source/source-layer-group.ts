import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import { createSourceLayer } from '../../factories/create-source-layer'
import SourceLayerCommon from './source-layer-common'

import type { RawGroupLayer, RawLayer } from '../../typings/source'
import type { SourceLayer } from '../../factories/create-source-layer'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerGroupOptions = {
  parent: SourceLayerParent
  rawValue: RawGroupLayer
}

export default class SourceLayerGroup extends SourceLayerCommon {
  protected _rawValue: RawGroupLayer
  private _children: SourceLayer[]

  constructor(options: SourceLayerGroupOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
    this._children = this._initChildren()
  }

  private _initChildren() {
    const children = asArray(this._rawValue?.group?.children)
    return children.reduce((children: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this,
      })
      return sourceLayer ? push(children, sourceLayer) : children
    }, [])
  }

  get children(): SourceLayer[] {
    return this._children
  }
}
