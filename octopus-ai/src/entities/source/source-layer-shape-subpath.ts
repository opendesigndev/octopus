import { asArray } from '@avocode/octopus-common/dist/utils/as'

import type { RawShapeLayerSubPath, RawShapeLayerSubPathPoint } from '../../typings/raw'
import type { SourceLayerShape } from './source-layer-shape'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

type SourceLayerShapeOptions = {
  parent: SourceLayerShape
  rawValue: RawShapeLayerSubPath
}

export class SourceLayerShapeSubPath {
  protected _rawValue: RawShapeLayerSubPath
  private _points: RawShapeLayerSubPathPoint[]
  private _parent: SourceLayerShape
  private _coords: number[]

  constructor(options: SourceLayerShapeOptions) {
    this._rawValue = options.rawValue
    this._parent = options.parent

    this._points = asArray(
      options.rawValue?.Points?.map((point) => ({
        ...point,
        Coords: asArray(point.Coords),
      }))
    )

    const rectangleCoords = options.rawValue?.Coords

    this._coords = asArray(rectangleCoords)
  }

  get type(): Nullable<string> {
    return this._rawValue.Type
  }

  get closed(): Nullable<boolean> {
    return this._rawValue.Closed
  }

  get coords(): Nullable<number[]> {
    return this._coords
  }

  get points(): RawShapeLayerSubPathPoint[] {
    return this._points
  }

  get rawValue(): RawShapeLayerSubPath {
    return this._rawValue
  }
}
