import { RawShapeLayerSubPath } from '../typings/source/shape-layer';
import SourceLayerShape from './source-layer-shape';


type SourceLayerShapeOptions = {
    parent: SourceLayerShape,
    rawValue: RawShapeLayerSubPath,
    path: number[]
  }

export default class SourceLayerShapeSubPath {
    private _rawValue: RawShapeLayerSubPath
    
    constructor(options: SourceLayerShapeOptions){
        this._rawValue = options.rawValue
    }

    get type () {
        return this._rawValue.Type
    }

    get coords (){
        return this._rawValue.Coords
    }
}