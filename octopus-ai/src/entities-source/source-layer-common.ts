import SourceArtboard from "./source-artboard"
import SourceLayerGroup from "./source-layer-group"

export type SourceLayerParent = SourceLayerGroup | SourceArtboard

export default class SourceLayerCommon {
    protected _path: number[]

    constructor(path: number[]){
        this._path=path
    }

    get path () {
        return this._path
    }
}