import { asNumber } from '@avocode/octopus-common/dist/utils/as'

import SourceLayerShape from "../entities-source/source-layer-shape"
import SourceResources from "../entities-source/source-resources"
import type { Octopus } from '../typings/octopus'
import OctopusEffectColorFill from "./octopus-effect-color-fill"

type OctopusEffectStrokeOptions = {
    resources: SourceResources
    sourceLayer: SourceLayerShape
}

type LineJoin = 'MITER' | 'ROUND' | 'BEVEL'


export default class OctopusEffectStroke {
    private _resources: SourceResources
    private _sourceLayer: SourceLayerShape 
    
    static LINE_JOIN_MAP = ['MITER','ROUND', 'BEVEL'] as const
    static LINE_CAP_MAP = ['BUTT','ROUND', 'SQUARE'] as const

    constructor (options: OctopusEffectStrokeOptions) {
        this._resources = options.resources
        this._sourceLayer =  options.sourceLayer
    }

    // private _getColorSpaceNonStroking(){
    //     const colorSpaceNonStroking = this._sourceLayer.colorSpaceNonStroking
    //     return this._resources.getColorSpaceValue(colorSpaceNonStroking)
    //  }

    private _parseDashing() {
        const dashing =  this._sourceLayer.dashPattern?.[0] || []
        const dashOffset =  this._sourceLayer.dashPattern?.[1] || 0

        if (dashing.length === 0) {
            return {}
          }

          return { dashing, dashOffset}
    }

  private get lineJoin():LineJoin{
        return OctopusEffectStroke.LINE_JOIN_MAP[this._sourceLayer.lineJoin]
    }

    private get lineCap() {
        return OctopusEffectStroke.LINE_CAP_MAP[this._sourceLayer.lineJoin]
    }

    convert(): Octopus['VectorStroke'] | null {
        const dashProperties = this._parseDashing()
        const style = dashProperties.dashing ? 'DASHED' : 'SOLID'
        const fill = (new OctopusEffectColorFill({
            resources:this._resources,
            sourceLayer:this._sourceLayer,
            colorSpaceType: 'ColorSpaceStroking'
        })).convert()

        return {
            thickness: asNumber(this._sourceLayer.lineWidth),
            fill,
            position: 'CENTER',
            visible: true,
            style,
            lineJoin: this.lineJoin,
            lineCap: this.lineCap,
            ...dashProperties,
        }   
    }
}  