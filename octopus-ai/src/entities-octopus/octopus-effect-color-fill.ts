import SourceLayerShape from "../entities-source/source-layer-shape"
import SourceResources from "../entities-source/source-resources"
import {convertDeviceRGB, getColorSpaceName, convertDeviceCMYK, convertDeviceGray, convertICCBased, guessColorSpaceByComponents, parseColor} from '../utils/colors'
import type { Octopus } from '../typings/octopus'

type ColorSpaceType = 'ColorSpaceStroking' | 'ColorSpaceNonStroking'

type OctopusEffectColorFillOptions = {
    resources: SourceResources
    sourceLayer: SourceLayerShape
    colorSpaceType: ColorSpaceType
}

export default class OctopusEffectColorFill {
    private _resources: SourceResources
    private _sourceLayer: SourceLayerShape
    private _colorSpaceType: ColorSpaceType

    constructor (options: OctopusEffectColorFillOptions) {
        this._resources = options.resources
        this._sourceLayer =  options.sourceLayer
        this._colorSpaceType =  options.colorSpaceType

    }

    //colorSpace
    private get colorSpace(): object | string | null{
        const colorSpaceName = this._colorSpaceType === 'ColorSpaceStroking'
        ? this._sourceLayer.colorSpaceStroking
        : this._sourceLayer.colorSpaceNonStroking
        // check this mess of types
        return this._resources.getColorSpaceValue(colorSpaceName)
    }


    private _parseColor () {
        const color = this._sourceLayer.colorStroking || []
                // check this mess of types
        const colorSpace = this.colorSpace
        const colorSpaceName = getColorSpaceName(colorSpace)

        switch(colorSpace){
            case 'DeviceRGB':
                return convertDeviceRGB(color)
              case 'DeviceCMYK':
                return convertDeviceCMYK(color)
              case 'DeviceGray':
                return convertDeviceGray(color)
              case 'ICCBased':
                return convertICCBased(color)
              default:
                console.warn('convertColor', 'Unknown ColorSpace', {colorSpaceName})
                return guessColorSpaceByComponents(color)
        }
    }

    convert(): Octopus['FillColor'] {
        const [r,g,b] = parseColor(this._parseColor())
        return {
            type: 'COLOR' as const,
            color: {r,g,b,a:1},
        }
    }

}