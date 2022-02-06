import { RawTextLayerText } from "../typings/source";
import {SourceLayerParent} from './source-layer-common'

type SourceLayerTextNormalizedOptions = {
    parent: SourceLayerParent,
    rawValue: RawTextLayerText,
  }

export default class SourceLayerTextNormalized {
    private _rawValue: RawTextLayerText
    private _parent: SourceLayerParent

    constructor(options:SourceLayerTextNormalizedOptions){
        this._rawValue = options.rawValue
        this._parent = options.parent
    }

      get graphicsState(){  
        return this._rawValue.GraphicsState

    }

    //post script name or fontDict
    get font(){
        const fontId = this.graphicsState?.TextFont || ''
        const resources = this._parent.resources

        return resources?.getFontById(fontId)
    }

    get fontDescriptor () {
        return this.font?.FontDescriptor
    }

    get parsedTextValue(){
        const stringOrArrayText= this._rawValue.Text

        return Array.isArray(stringOrArrayText)
        ? stringOrArrayText.filter(stringOrNum=>typeof stringOrNum === 'string').join('')
        : stringOrArrayText
    }
}