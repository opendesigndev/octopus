import SourceLayerCommon from './source-layer-common'
import {RawTextLayer} from '../typings/source'
import {SourceLayerParent} from './source-layer-common'
import SourceLayerNormalizedText from './source-layer-normalized-text'

type SourceLayerTextOptions = {
    parent: SourceLayerParent,
    rawValue: RawTextLayer,
    path: number[]
  }


export default class SourceLayerText extends SourceLayerCommon {
    protected _rawValue: RawTextLayer

    constructor(options: SourceLayerTextOptions){
        super(options)
        this._parent=options.parent
        this._rawValue=options.rawValue
    }

    get texts() {
        return this._rawValue?.Texts
        .filter(text=>text)
        .map(text=>new SourceLayerNormalizedText({rawValue:text, parent: this._parent}))
      } 
}