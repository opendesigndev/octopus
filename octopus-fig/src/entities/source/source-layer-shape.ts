import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import { getGeometryFor, getSizeFor } from '../../utils/source'
import { SourceLayerCommon } from './source-layer-common'
import { SourcePaint } from './source-paint'

import type { RawBooleanOperation, RawLayerShape } from '../../typings/raw'
import type { SourceGeometry, SourceSize } from '../../typings/source'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

type SourceShapeType = 'RECTANGLE' | 'LINE' | 'VECTOR' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'STAR' | 'BOOLEAN_OPERATION'

export class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawLayerShape
  private _layers: SourceLayerShape[]

  constructor(options: SourceLayerShapeOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  private _initLayers() {
    const layers = asArray(this._rawValue?.children)
    return layers.reduce(
      (layers: SourceLayerShape[], layer: RawLayerShape) =>
        push(layers, new SourceLayerShape({ parent: this, rawValue: layer })),
      []
    )
  }

  get type(): 'SHAPE' {
    return 'SHAPE'
  }

  get shapeType(): SourceShapeType | undefined {
    return this._rawValue.type
  }

  get size(): SourceSize | null {
    return getSizeFor(this._rawValue.size)
  }

  get fillGeometry(): SourceGeometry[] {
    return getGeometryFor(this._rawValue.fillGeometry)
  }

  get strokeGeometry(): SourceGeometry[] {
    return getGeometryFor(this._rawValue.strokeGeometry)
  }

  get cornerRadius(): number | undefined {
    return this._rawValue.cornerRadius
  }

  get layers(): SourceLayerShape[] {
    return this._layers
  }

  get booleanOperation(): RawBooleanOperation | undefined {
    return this._rawValue.booleanOperation
  }

  @firstCallMemo()
  get fills(): SourcePaint[] {
    return this._rawValue.fills?.map((paint) => new SourcePaint({ rawValue: paint })) ?? []
  }

  @firstCallMemo()
  get strokes(): SourcePaint[] {
    return this._rawValue.strokes?.map((paint) => new SourcePaint({ rawValue: paint })) ?? []
  }
}
