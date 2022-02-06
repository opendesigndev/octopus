import SourceLayerShape from "../entities-source/source-layer-shape"
import SourceResources from "../entities-source/source-resources"
import { SourceLayer } from "../factories/create-source-layer"

type OctopusEffectStrokeOptions = {
    resources: SourceResources
    sourceLayer: SourceLayerShape
}

type LineJoin = 'MITER' | 'ROUND' | 'BEVEL'

type ColorSpaceTypeOptions = 'ColorSpaceNonStroking'|'ColorSpaceStroking' 
export default class OctopusEffectStroke {
    private _resources: SourceResources
    private _sourceLayer: SourceLayerShape 
    
    static LINE_JOIN_MAP = ['MITER','ROUND', 'BEVEL'] as const
    static LINE_CAP_MAP = ['BUTT','ROUND', 'SQUARE'] as const

    constructor (options: OctopusEffectStrokeOptions) {
        this._resources = options.resources
        this._sourceLayer =  options.sourceLayer
    }

    private _getColorSpaceStroking(){
        const colorSpaceStroking = this._sourceLayer.colorSpaceStroking
        return this._resources.getColorSpaceValue(colorSpaceStroking)
    }

    private _getColorSpaceNonStroking(){
        const colorSpaceNonStroking = this._sourceLayer.colorSpaceNonStroking
        return this._resources.getColorSpaceValue(colorSpaceNonStroking)
     }


   get lineJoin():LineJoin{
        return OctopusEffectStroke.LINE_JOIN_MAP[this._sourceLayer.lineJoin]
    }

    get lineCap() {
        return OctopusEffectStroke.LINE_CAP_MAP[this._sourceLayer.lineJoin]
    }
}  