import SourceLayerCommon from './source-layer-common'
import {RawGroupLayer, RawLayer} from '../typings/source'
import {SourceLayerParent} from './source-layer-common'
import { asArray } from '../utils/as';
import { createSourceLayer, SourceLayer } from '../factories/create-source-layer';
import SourceArtboard from './source-artboard';
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

    get getExtGState () {
       const specifiedParameters = this._rawValue.GraphicsState?.SpecifiedParameters || ''
       return this._parent.resources?.ExtGState?.[specifiedParameters]
    }
}