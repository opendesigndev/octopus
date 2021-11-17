type OctopusBoundsOptions = {
  x: number,
  y: number,
  w: number,
  h: number
}

export default class OctopusBounds {
  _x: number
  _y: number
  _w: number
  _h: number

  static from(x: number, y: number, w: number, h: number): OctopusBounds {
    return new this({ x, y, w , h })
  }

  constructor(options: OctopusBoundsOptions) {
    this._x = options.x
    this._y = options.y
    this._w = options.w
    this._h = options.h
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