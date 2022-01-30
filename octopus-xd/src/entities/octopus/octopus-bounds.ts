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