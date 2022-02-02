import { RawTextLayerText } from "../typings/source";
import {SourceLayerParent} from './source-layer-common'

type SourceLayerNormalizedTextOptions = {
    parent: SourceLayerParent,
    rawValue: RawTextLayerText,
  }

export default class SourceLayerNormalizedText {
    private _rawValue: RawTextLayerText
    private _parent: SourceLayerParent

    constructor(options:SourceLayerNormalizedTextOptions){
        this._rawValue = options.rawValue
        this._parent = options.parent
    }

      get graphicState(){  
        return this._rawValue.GraphicsState

    }

    //post script name or fontDict
    get font(){
        const textFont = this.graphicState?.TextFont || ''
        const resources = this._parent.resources

        return resources?.Font?.[textFont]
    }

    get fontDescriptor () {
        return this.font?.FontDescriptor
    }
}