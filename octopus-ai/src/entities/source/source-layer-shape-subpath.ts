import { asArray } from '@avocode/octopus-common/dist/utils/as'

import { invertYCooords } from '../../utils/coords'

import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type { RawShapeLayerSubPath, RawShapeLayerSubPathPoint } from '../../typings/raw'
import type SourceLayerShape from './source-layer-shape'

type SourceLayerShapeOptions = {
  parent: SourceLayerShape
  rawValue: RawShapeLayerSubPath
  path: number[]
}

export default class SourceLayerShapeSubPath {
  protected _rawValue: RawShapeLayerSubPath
  private _points: RawShapeLayerSubPathPoint[]
  private _parent: SourceLayerShape
  private _coords: number[]

  constructor(options: SourceLayerShapeOptions) {
    this._rawValue = options.rawValue
    this._parent = options.parent

    const artboardHeight = this._parent.parentArtboardHeight

    this._points = asArray(
      options.rawValue?.Points?.map((point) => ({
        ...point,
        Coords: invertYCooords(point.Coords ?? [], artboardHeight),
      }))
    )

    const rectangleCoords = options.rawValue?.Coords

    // we are transforming y only. Coords have structure [x,y, width, height]
    this._coords = rectangleCoords
      ? [...rectangleCoords.slice(0, 1), artboardHeight - rectangleCoords[1], ...rectangleCoords.slice(2)]
      : []
  }

  get type(): Nullable<string> {
    return this._rawValue.Type
  }

  get coords(): Nullable<number[]> {
    return this._coords
  }

  get points(): RawShapeLayerSubPathPoint[] {
    return this._points
  }
}
