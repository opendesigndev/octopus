import { asArray } from '@avocode/octopus-common/dist/utils/as'

import convertColor, { parseColor } from '../../utils/colors.js'

import type { Octopus } from '../../typings/octopus/index.js'
import type { RawResourcesColorSpace } from '../../typings/raw/resources.js'
import type SourceLayerShape from '../source/source-layer-shape.js'
import type SourceLayerSubText from '../source/source-layer-sub-text.js'

export enum ColorSpace {
  STROKING = 'ColorSpaceStroking',
  NON_STROKING = 'ColorSpaceNonStroking',
}

type OctopusEffectColorFillOptions = {
  sourceLayer: SourceLayerShape | SourceLayerSubText
  colorSpaceType: ColorSpace
  colorSpaceValue: string | RawResourcesColorSpace[string]
}

export default class OctopusEffectColorFill {
  private _sourceLayer: SourceLayerShape | SourceLayerSubText
  private _colorSpaceType: ColorSpace
  private _colorSpaceValue: string | RawResourcesColorSpace[string]

  constructor(options: OctopusEffectColorFillOptions) {
    this._sourceLayer = options.sourceLayer
    this._colorSpaceType = options.colorSpaceType
    this._colorSpaceValue = options.colorSpaceValue
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

    return convertColor(color, this._colorSpaceValue)
  }

  convert(): Octopus['FillColor'] {
    const [r, g, b] = parseColor(this._parseColor())
    return {
      type: 'COLOR' as const,
      color: { r, g, b, a: 1 },
    }
  }
}
