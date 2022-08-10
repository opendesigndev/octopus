import { asArray } from '@avocode/octopus-common/dist/utils/as'
import chunk from 'lodash/chunk.js'
import zipWith from 'lodash/zipWith.js'

import convertColor from '../../utils/colors.js'

import type { Coord, GradientColorStop, GradientStop, RgbColorComponents } from '../../typings/index.js'
import type { Octopus } from '../../typings/octopus/index.js'
import type { RawResourcesColorSpace, RawResourcesShadingKeyFunctionFunction } from '../../typings/raw/resources.js'
import type SourceLayerShape from '../source/source-layer-shape.js'
import type SourceResources from '../source/source-resources.js'

type OctopusEffectGradientFillOptions = {
  sourceLayer: SourceLayerShape
  resources: SourceResources
}

export default class OctopusEffectGradientFill {
  static DEFAULT_RGB_COLOR = [0, 0, 0]

  private _resources: SourceResources
  private _sourceLayer: SourceLayerShape

  constructor(options: OctopusEffectGradientFillOptions) {
    this._resources = options.resources
    this._sourceLayer = options.sourceLayer
  }

  private _parseType2Function(
    fn: RawResourcesShadingKeyFunctionFunction,
    encode: Coord,
    colorSpace: string
  ): [GradientStop, GradientStop] {
    const stop1 = {
      color: this._getColorFromBlock(fn, 'C0', encode, colorSpace),
      exp: fn.N ?? 1,
      reverseExp: encode[0] === 1,
    }

    const stop2 = {
      color: this._getColorFromBlock(fn, 'C1', encode, colorSpace),
    }

    return [stop1, stop2]
  }

  private _getColorFromBlock(
    block: RawResourcesShadingKeyFunctionFunction,
    color: 'C0' | 'C1',
    encode: Coord,
    colorSpace: RawResourcesColorSpace['key'] | string
  ): RgbColorComponents {
    if (encode[0] === 1) {
      color = color === 'C0' ? 'C1' : 'C0'
    }

    return convertColor(block[color] || OctopusEffectGradientFill.DEFAULT_RGB_COLOR, colorSpace)
  }

  private _readEncode(count: number): Coord[] {
    const shadingName = this._sourceLayer.name
    const encode = this._resources.getShadingFunctionEncode(shadingName)

    if (!encode) {
      return Array(count).fill([0, 1])
    }

    const encodePairs = chunk(encode, 2)

    return encodePairs as Coord[]
  }

  private _parseType3Function(colorSpace: string): GradientStop[] {
    const shadingName = this._sourceLayer.name
    const bounds = asArray(this._resources.getShadingFunctionBounds(shadingName))
    const functions = asArray(this._resources.getShadingFunctionFunctions(shadingName))
    const encode = this._readEncode(functions.length)

    return zipWith(functions, encode, (f, e) => this._parseType2Function(f, e, colorSpace)).reduce(
      (acc: GradientStop[], stops, i) => {
        acc.push({ ...stops[0], position: i === 0 ? 0 : bounds[i - 1] })

        if (i === bounds.length) {
          acc.push({ ...stops[1], position: 1 })
        }
        return acc
      },
      []
    )
  }

  private _parseStops() {
    const shadingName = this._sourceLayer.name
    const colorSpace = this._resources.getShadingColorSpace(shadingName)
    const colorStops = this._parseType3Function(colorSpace)
    const alphaStops = this._parseAlphaStops(colorStops.length)

    return zipWith(colorStops, alphaStops, this._mergeColorWithAlpha)
  }

  private _mergeColorWithAlpha(colorStop: GradientStop, a: number): GradientColorStop {
    //@ sort out dual color (check type file)
    const [r, g, b] = colorStop.color as RgbColorComponents
    const color = { r, g, b, a }

    return {
      color,
      position: colorStop.position ?? 0,
    }
  }

  private _parseAlphaStops(colorStopCount: number): number[] {
    const gradientMask = this._sourceLayer.gradientMask
    if (gradientMask) {
      return this._parseType3Function('DeviceGray').map((stop) => stop.color[0] / 255)
    }

    return Array(colorStopCount).fill(1)
  }

  private _parseLinearGradient(): Octopus['FillGradient']['gradient'] {
    return {
      type: 'LINEAR',
      stops: this._parseStops(),
    }
  }

  private _parseRadialGradient(): Octopus['FillGradient']['gradient'] {
    return {
      type: 'RADIAL',
      stops: this._parseStops(),
    }
  }

  private _parseGradient(): Octopus['FillGradient']['gradient'] {
    const shadingName = this._sourceLayer.name
    const shadingType = this._resources.getShadingType(shadingName)

    switch (shadingType) {
      case 2:
        return this._parseLinearGradient()
      case 3:
        return this._parseRadialGradient()
      default:
        //@todo use logger
        console.warn('parseShading', 'Unsupported shading type', { shadingType })
        return this._parseLinearGradient()
    }
  }

  private _parsePositioning(): Octopus['FillGradient']['positioning'] {
    //@todo provided  default values but changing makes no difference
    //https://octopus-schema.avocode.com/#FillPositioning
    return {
      layout: 'FILL',
      origin: 'LAYER',
      transform: this._sourceLayer.transformMatrix,
    }
  }

  convert(): Octopus['FillGradient'] {
    const gradient = this._parseGradient()
    const positioning = this._parsePositioning()

    return { type: 'GRADIENT', gradient, positioning }
  }
}
