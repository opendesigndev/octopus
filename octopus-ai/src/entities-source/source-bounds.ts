import _ from 'lodash'


type SourceBoundsOptions = {
    top: number,
    left: number,
    width: number,
    height: number
  }
  
  export default class SourceBounds {
    private _top: number
    private _left: number
    private _width: number
    private _height: number
  
    static from(top: number, left: number, width: number, height: number): SourceBounds {
      return new this({ top, left, width , height })
    }
  
    constructor(options: SourceBoundsOptions) {
      this._top = options.top
      this._left = options.left
      this._width = options.width
      this._height = options.height
    }
  
    convert() {
      return {
        top:this._top,
        left: this._left,
        right: this._left + this._width,
        bottom: this._top + this._height
      }
    }
  }