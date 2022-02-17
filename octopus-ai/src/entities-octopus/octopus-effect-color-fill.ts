import SourceLayerShape from '../entities-source/source-layer-shape'
import SourceResources from '../entities-source/source-resources'
import {
  convertDeviceRGB,
  getColorSpaceName,
  convertDeviceCMYK,
  convertDeviceGray,
  convertICCBased,
  guessColorSpaceByComponents,
  parseColor,
  convertRGBToRGBA,
} from '../utils/colors'
import type { Octopus } from '../typings/octopus'
import { Nullable } from '../typings/helpers'
import type { RawResourcesColorSpace } from '../typings/source/resources'
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

  constructor(options: OctopusEffectColorFillOptions) {
    this._resources = options.resources
    this._sourceLayer = options.sourceLayer
    this._colorSpaceType = options.colorSpaceType
  }

  //colorSpace
  private get colorSpace(): Nullable<string | RawResourcesColorSpace[string]> {
    const colorSpaceName =
      this._colorSpaceType === 'ColorSpaceStroking'
        ? this._sourceLayer.colorSpaceStroking
        : this._sourceLayer.colorSpaceNonStroking

    return this._resources.getColorSpaceValue(colorSpaceName || undefined)
  }

  private get color() {
    return (
      (this._colorSpaceType === 'ColorSpaceNonStroking'
        ? this._sourceLayer.colorNonStroking
        : this._sourceLayer.colorStroking) || []
    )
  }

  private _parseColor() {
    const color = this.color
    const colorSpace = this.colorSpace
    const colorSpaceName = getColorSpaceName(colorSpace || null)

    switch (colorSpace) {
      case 'DeviceRGB':
        return convertRGBToRGBA(convertDeviceRGB(color))
      case 'DeviceCMYK':
        return convertRGBToRGBA(convertDeviceCMYK(color))
      case 'DeviceGray':
        return convertRGBToRGBA(convertDeviceGray(color))
      case 'ICCBased':
        return convertRGBToRGBA(convertICCBased(color))
      default:
        //@todo: remove console logger
        console.warn('convertColor', 'Unknown ColorSpace', { colorSpaceName })
        return convertRGBToRGBA(guessColorSpaceByComponents(color))
    }
  }

  convert(): Octopus['FillColor'] {
    const [r, g, b] = parseColor(this._parseColor())
    return {
      type: 'COLOR' as const,
      color: { r, g, b, a: 1 },
    }
  }
}
