import type { Coord } from '../../typings/index.js'
import type { OctopusPoint as OctopusPointType } from '../../utils/create-shape.js'

export type NormalizedPoint = { anchor: Coord; inBezier?: Coord; outBezier?: Coord }

export default class OctopusPoint {
  coords: number[]
  outBezier?: number[]
  inBezier?: number[]

  constructor(point: NormalizedPoint) {
    this.coords = point.anchor
    this.outBezier = point.outBezier
    this.inBezier = point.inBezier
  }

  private _createSimplePoint(coordinates: number[]) {
    return this._createPoint('point', coordinates)
  }

  private _createBezierPoint(coordinates: number[]) {
    return this._createPoint('bezier', coordinates)
  }

  private _createPoint(type: 'point' | 'bezier', coordinates: number[]) {
    return { type, coordinates }
  }

  convert(): OctopusPointType {
    if (!this.outBezier && !this.inBezier) {
      return this._createSimplePoint([...this.coords])
    }

    this.outBezier = this.outBezier || this.coords
    this.inBezier = this.inBezier || this.coords
    const coords = [...this.inBezier, ...this.outBezier, ...this.coords]

    return this._createBezierPoint(coords)
  }
}
