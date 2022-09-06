import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import { createSourceLayer } from '../../factories/create-source-layer'
import { SourceLayerCommon } from './source-layer-common'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawBooleanOperation, RawLayerShape } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

type SourceShapeType = 'RECTANGLE' | 'LINE' | 'VECTOR' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'STAR' | 'BOOLEAN_OPERATION'

export class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawLayerShape
  private _children: SourceLayer[]

  constructor(options: SourceLayerShapeOptions) {
    super(options)
    this._children = this._initLayers()
  }

  private _initLayers() {
    const children = asArray(this._rawValue?.children)
    return children.reduce((children: SourceLayerShape[], layer: RawLayerShape) => {
      const sourceLayer = createSourceLayer({ parent: this, layer })
      return sourceLayer ? push(children, sourceLayer) : children
    }, [])
  }

  get type(): 'SHAPE' {
    return 'SHAPE'
  }

  get shapeType(): SourceShapeType | undefined {
    return this._rawValue.type
  }

  get children(): SourceLayer[] {
    return this._children
  }

  get booleanOperation(): RawBooleanOperation | undefined {
    return this._rawValue.booleanOperation
  }
}
