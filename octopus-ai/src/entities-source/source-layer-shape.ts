import SourceLayerCommon from './source-layer-common'
import {SourceLayerParent} from './source-layer-common'
import { RawShapeLayer } from '../typings/source/shape-layer';
import SourceLayerShapeSubPath from './source-layer-shape-subpath'

type SourceLayerShapeOptions = {
    parent: SourceLayerParent,
    rawValue: RawShapeLayer,
    path: number[]
  }

  export default class SourceLayerShape extends SourceLayerCommon {
    protected _rawValue: RawShapeLayer
    private _subpaths: SourceLayerShapeSubPath []

    constructor(options: SourceLayerShapeOptions){
        super(options)
        this._rawValue = options.rawValue
        this._subpaths=  this._initSubpaths()
    }


    private _initSubpaths() {
        const path = this.path
        return this._rawValue.Subpaths?.map(subPath=>new SourceLayerShapeSubPath({path,rawValue:subPath,parent:this}))||[]
    }
    
    private _isRect(){
        return this._subpaths.length > 0 
        && this._subpaths.every(subpath => subpath.type === 'Rect')
    }
    
    get name () {
        return this._isRect() ? '<Rectangle>' : '<Path>'
      }

    get subPaths(){
        return this._subpaths
    }

    get graphicsState () {
        return this._rawValue.GraphicsState
    }

    get dashPattern () {
        return this.graphicsState?.DashPattern
    }

    get getExtGState () {
       const specifiedParameters = this.graphicsState?.SpecifiedParameters || ''
       return this._parent.resources?.ExtGState?.[specifiedParameters]
    }

    get fillRule() {
        return this._rawValue.FillRule
    }

    get isStroke() {
        return Boolean(this._rawValue.Stroke)
    }

    get lineJoin(){
     return this.graphicsState?.LineJoin || 0
    }
  
    get lineCap() {
      return this.graphicsState?.LineCap || 0
    }

    get colorStroking() {
        return this.graphicsState?.ColorStroking
    }

    get colorSpaceNonStroking (){
        return this.graphicsState?.ColorSpaceNonStroking
    }

    get colorSpaceStroking (){
        return this.graphicsState?.ColorSpaceStroking
    }
    
    get colorNonStroking () {
        return this.graphicsState?.ColorNonStroking
    }
    
    get lineWidth() {
        return this.graphicsState?.LineWidth
    }
   
    get transformMatrix () {
        return this._rawValue?.GraphicsState?.CTM || [1, 0, 0, 1, 0, 0]
    }

    get fill () {
        return this._rawValue.Fill
    }

    get stroke () {
        return this._rawValue.Stroke
    }
}