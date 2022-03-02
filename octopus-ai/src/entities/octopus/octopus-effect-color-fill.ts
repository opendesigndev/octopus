import { asArray } from '@avocode/octopus-common/dist/utils/as'

import convertColor, { parseColor } from '../../utils/colors'

import type SourceLayerShape from '../source/source-layer-shape'
import type SourceResources from '../source/source-resources'
import type { Octopus } from '../../typings/octopus'
import type { RawResourcesColorSpace } from '../../typings/raw/resources'

export enum ColorSpace {
  STROKING = 'ColorSpaceStroking',
  NON_STROKING = 'ColorSpaceNonStroking',
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

  private get _colorSpace(): string | RawResourcesColorSpace[string] {
    const colorSpaceName =
      this._colorSpaceType === ColorSpace.STROKING
        ? this._sourceLayer.colorSpaceStroking
        : this._sourceLayer.colorSpaceNonStroking

    return this._resources.getColorSpaceValue(colorSpaceName || undefined) ?? ''
  }

  private get _color() {
    return asArray(
      this._colorSpaceType === ColorSpace.NON_STROKING
        ? this._sourceLayer.colorNonStroking
        : this._sourceLayer.colorStroking
    )
  }

  private _parseColor() {
    const color = this._color
    const colorSpace = this._colorSpace ?? ''

    return convertColor(color, colorSpace)
  }

  convert(): Octopus['FillColor'] {
    const [r, g, b] = parseColor(this._parseColor())
    return {
      type: 'COLOR' as const,
      color: { r, g, b, a: 1 },
    }
  }
}
