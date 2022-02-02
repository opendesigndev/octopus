type OctopusBoundsOptions = {
  x: number,
  y: number,
  w: number,
  h: number
}

export default class OctopusBounds {
  private _x: number
  private _y: number
  private _w: number
  private _h: number

  static from(x: number, y: number, w: number, h: number): OctopusBounds {
    return new this({ x, y, w , h })
  }

  static fromPaperBounds(bounds: paper.Rectangle) {
    return new this({
      x: bounds.left,
      y: bounds.top,
      w: bounds.width,
      h: bounds.height
    })
  }

  constructor(options: OctopusBoundsOptions) {
    this._x = options.x
    this._y = options.y
    this._w = options.w
    this._h = options.h
  }

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }

  get w() {
    return this._w
  }

  get h() {
    return this._h
  }

  convert() {
    return {
      x: this._x,
      y: this._y,
      w: this._w,
      h: this._h
    }
  }
}