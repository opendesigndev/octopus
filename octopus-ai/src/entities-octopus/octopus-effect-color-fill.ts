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

import type SourceLayerShape from '../entities-source/source-layer-shape'
import type SourceResources from '../entities-source/source-resources'
import type { Octopus } from '../typings/octopus'
import type { Nullable } from '../typings/helpers'
import type { RawResourcesColorSpace } from '../typings/source/resources'

export enum ColorSpace {
  COLOR_SPACE_STROKING = 'ColorSpaceStroking',
  COLOR_SPACE_NON_STROKING = 'ColorSpaceNonStroking',
}

type OctopusEffectColorFillOptions = {
  resources: SourceResources
  sourceLayer: SourceLayerShape
  colorSpaceType: ColorSpace
}

export default class OctopusEffectColorFill {
  private _resources: SourceResources
  private _sourceLayer: SourceLayerShape
  private _colorSpaceType: ColorSpace

  constructor(options: OctopusEffectColorFillOptions) {
    this._resources = options.resources
    this._sourceLayer = options.sourceLayer
    this._colorSpaceType = options.colorSpaceType
  }

  //colorSpace
  private get _colorSpace(): Nullable<string | RawResourcesColorSpace[string]> {
    const colorSpaceName =
      this._colorSpaceType === ColorSpace.COLOR_SPACE_STROKING
        ? this._sourceLayer.colorSpaceStroking
        : this._sourceLayer.colorSpaceNonStroking

    return this._resources.getColorSpaceValue(colorSpaceName || undefined)
  }

  private get _color() {
    return (
      (this._colorSpaceType === ColorSpace.COLOR_SPACE_NON_STROKING
        ? this._sourceLayer.colorNonStroking
        : this._sourceLayer.colorStroking) || []
    )
  }

  private _parseColor() {
    const color = this._color
    const colorSpace = this._colorSpace
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
