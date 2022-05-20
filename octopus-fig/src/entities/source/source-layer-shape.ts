import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import { getGeometryFor } from '../../utils/source'
import { SourceLayerCommon } from './source-layer-common'

import type { RawBooleanOperation, RawLayerShape } from '../../typings/raw'
import type { SourceGeometry } from '../../typings/source'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

type SourceShapeType = 'RECTANGLE' | 'LINE' | 'VECTOR' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'STAR' | 'BOOLEAN_OPERATION'

export class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawLayerShape
  private _children: SourceLayerShape[]

  constructor(options: SourceLayerShapeOptions) {
    super(options)
    this._children = this._initLayers()
  }

  private _initLayers() {
    const children = asArray(this._rawValue?.children)
    return children.reduce(
      (children: SourceLayerShape[], layer: RawLayerShape) =>
        push(children, new SourceLayerShape({ parent: this, rawValue: layer })),
      []
    )
  }

  get type(): 'SHAPE' {
    return 'SHAPE'
  }

  get shapeType(): SourceShapeType | undefined {
    return this._rawValue.type
  }

  get fillGeometry(): SourceGeometry[] {
    return getGeometryFor(this._rawValue.fillGeometry)
  }

  get strokeGeometry(): SourceGeometry[] {
    return getGeometryFor(this._rawValue.strokeGeometry)
  }

  get children(): SourceLayerShape[] {
    return this._children
  }

  get booleanOperation(): RawBooleanOperation | undefined {
    return this._rawValue.booleanOperation
  }
}
