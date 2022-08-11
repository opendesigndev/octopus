import { asNumber } from '@avocode/octopus-common/dist/utils/as'

type OctopusBoundsOptions = {
  x: number
  y: number
  w: number
  h: number
}

export class OctopusBounds {
  private _x: number
  private _y: number
  private _w: number
  private _h: number

  static from(x: number, y: number, w: number, h: number): OctopusBounds {
    return new this({ x, y, w, h })
  }

  static fromPaperBounds(bounds: paper.Rectangle): OctopusBounds {
    return new this({
      x: bounds.left,
      y: bounds.top,
      w: bounds.width,
      h: bounds.height,
    })
  }

  constructor(options: OctopusBoundsOptions) {
    this._x = options.x
    this._y = options.y
    this._w = options.w
    this._h = options.h
  }

  get x(): number {
    return asNumber(this._x, 0)
  }

  get y(): number {
    return asNumber(this._y, 0)
  }

  get w(): number {
    return asNumber(this._w, 0)
  }

  get h(): number {
    return asNumber(this._h, 0)
  }

  convert(): { x: number; y: number; w: number; h: number } {
    return {
      x: this._x,
      y: this._y,
      w: this._w,
      h: this._h,
    }
  }
}
