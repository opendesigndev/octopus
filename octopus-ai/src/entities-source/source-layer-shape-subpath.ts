import { Nullable } from '../typings/helpers'
import { RawShapeLayerSubPath, RawShapeLayerSubPathPoint } from '../typings/source'
import { inverseYCoords } from '../utils/coords'
import SourceLayerShape from './source-layer-shape'

type SourceLayerShapeOptions = {
  parent: SourceLayerShape
  rawValue: RawShapeLayerSubPath
  path: number[]
}

export default class SourceLayerShapeSubPath {
  private _rawValue: RawShapeLayerSubPath
  private _points: RawShapeLayerSubPathPoint[]
  private _parent: SourceLayerShape
  private _coords: number[]

  constructor(options: SourceLayerShapeOptions) {
    this._rawValue = options.rawValue
    this._parent = options.parent

    const artboardHeight = this._parent.parentArtboardHeight

    this._points =
      options.rawValue?.Points?.map((point) => ({
        ...point,
        Coords: inverseYCoords(point.Coords, artboardHeight),
      })) || []

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
