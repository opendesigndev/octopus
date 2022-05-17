import { getGeometryFor, getSizeFor } from '../../utils/source'
import { SourceLayerCommon } from './source-layer-common'

import type { RawLayerShape } from '../../typings/raw'
import type { SourceGeometry, SourceSize } from '../../typings/source'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

type SourceShapeType = 'RECTANGLE' | 'LINE' | 'VECTOR' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'STAR' | 'BOOLEAN_OPERATION'

export class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawLayerShape

  constructor(options: SourceLayerShapeOptions) {
    super(options)
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

  // TODO

  // @firstCallMemo()
  // get path(): SourcePath {
  //   return new SourcePath(this._rawValue.path)
  // }

  // get pathComponents(): SourcePathComponent[] {
  //   return this.path.pathComponents
  // }

  // get firstPathComponent(): SourcePathComponent | undefined {
  //   return this.pathComponents[0]
  // }

  // get pathBounds(): SourceBounds {
  //   return this.path.bounds
  // }

  // @firstCallMemo()
  // get fill(): SourceEffectFill {
  //   return new SourceEffectFill(this._rawValue.fill, this._rawValue.strokeStyle?.fillEnabled)
  // }

  // @firstCallMemo()
  // get stroke(): SourceStroke {
  //   return new SourceStroke(this._rawValue.strokeStyle)
  // }
}
