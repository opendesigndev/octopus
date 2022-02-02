import SourceArtboard from "./source-artboard"
import SourceLayerGroup from "./source-layer-group"
import type { RawArtBoardEntryResources, RawLayer } from '../typings/source'

export type SourceLayerParent = SourceLayerGroup | SourceArtboard

type SourceLayerCommonOptions = {
    parent: SourceLayerParent,
    rawValue: RawLayer,
    path: number[]
  }

export default class SourceLayerCommon {
    protected _parent: SourceLayerParent
    protected _rawValue: RawLayer
    protected _path: number[]

    constructor(options:SourceLayerCommonOptions){
        this._path=options.path
        this._rawValue=options.rawValue
        this._path=options.path
    }

    get path () {
        return this._path
    }

    // no properties in rawLayer
    get visible() {
        return true
      }

    get type (){
        return this._rawValue.Type
    }
    
    get raw () {
        return this._rawValue
    }

    get resources (): RawArtBoardEntryResources | undefined {
        return this._parent.resources
    }
}