import { RawSource } from "../typings/source";
import { RawArtboardEntry } from "../typings/source/artboard";
import SourceArtboard from './source-artboard'

type SourceDesignOptions= {
    artboards:RawArtboardEntry[]
}


export default class SourceDesign {
    private _artboards: SourceArtboard []

    static fromRawSource(source: RawSource){
        if(!source?.Root?.Pages?.Kids){
            throw new Error('Missing "Kids" array entry from the source design.')
        }
        const options = {
            artboards: source.Root.Pages.Kids,
        }
        
        return new this(options)
    }

    constructor (options:SourceDesignOptions){
        this._artboards = options.artboards.map((rawArtboard)=>new SourceArtboard(rawArtboard))
    }

    get artboards (){
        return this._artboards
    }
}