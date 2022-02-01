import SourceLayerCommon from './source-layer-common'
import {RawTextLayer} from '../typings/source'
import {SourceLayerParent} from './source-layer-common'

type SourceLayerTextOptions = {
    parent: SourceLayerParent,
    rawValue: RawTextLayer,
    path: number[]
  }


export default class SourceLayerText extends SourceLayerCommon {
    private _rawValue: RawTextLayer
    private _parent: SourceLayerParent

    constructor(options: SourceLayerTextOptions){
        super(options.path)
        this._parent=options.parent
        this._rawValue=options.rawValue
    }

    get raw () {
        return this._rawValue
    }

    get textValue() {
        return this._rawValue?.Texts
      } 
}