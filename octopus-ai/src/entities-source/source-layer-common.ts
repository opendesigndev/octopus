import SourceArtboard from "./source-artboard"
import SourceLayerGroup from "./source-layer-group"
import type { RawLayer } from '../typings/source'
import SourceLayerXObject from './source-layer-x-object'
import SourceResources from "./source-resources"

export type SourceLayerParent = SourceLayerGroup | SourceArtboard |SourceLayerXObject

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
        this._parent=options.parent
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

    get resources (): SourceResources | undefined {
        return this._parent.resources
    }

    get parentArtboard(): SourceArtboard | null {
        if (!this._parent) return null

        const parent = this._parent as SourceLayerGroup | SourceArtboard
        return parent instanceof SourceArtboard ? parent : parent.parentArtboard
      }
    
    get parentArtboardDimensions () {
        return this.parentArtboard?.dimensions || {width:0, height:0}
    }


}