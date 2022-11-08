import { asNumber } from '@opendesign/octopus-common/dist/utils/as'
import chunk from 'lodash/chunk'

import { OctopusEffectColorFill, ColorSpace } from './octopus-effect-color-fill'

import type { Octopus } from '../../typings/octopus'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourceResources } from '../source/source-resources'

type OctopusEffectStrokeOptions = {
  resources: SourceResources
  sourceLayer: SourceLayerShape
}

type LineJoin = 'MITER' | 'ROUND' | 'BEVEL'

export class OctopusEffectStroke {
  private _resources: SourceResources
  private _sourceLayer: SourceLayerShape

  static LINE_JOIN_MAP = ['MITER', 'ROUND', 'BEVEL'] as const
  static LINE_CAP_MAP = ['BUTT', 'ROUND', 'SQUARE'] as const

  /**@TODO remove this later. Rendering is having default miterLimit when not provided. For now we provide our own
   * for certainty.
   */
  static DEFAULT_MITER_LIMIT = 20
  static MIN_DASH_INPUT = 0.001

  constructor(options: OctopusEffectStrokeOptions) {
    this._resources = options.resources
    this._sourceLayer = options.sourceLayer
  }

  private _parseDashing(): number[] {
    const { dashing: rawDashing } = this._sourceLayer
    return chunk(rawDashing, 2)
      .map(([dash, offset]) => {
        return [
          Math.max(dash, OctopusEffectStroke.MIN_DASH_INPUT),
          Math.max(offset ?? 0, OctopusEffectStroke.MIN_DASH_INPUT),
        ]
      })
      .flat()
  }

  private _parseDashProperties() {
    const { miterLimit: rawMiterLimit } = this._sourceLayer
    const miterLimit = rawMiterLimit ?? OctopusEffectStroke.DEFAULT_MITER_LIMIT
    const dashOffset = this._sourceLayer.dashOffset

    return { dashing: this._parseDashing(), dashOffset, miterLimit }
  }

  private get _lineJoin(): LineJoin {
    return OctopusEffectStroke.LINE_JOIN_MAP[this._sourceLayer.lineJoin]
  }

  private get _lineCap() {
    return OctopusEffectStroke.LINE_CAP_MAP[this._sourceLayer.lineCap]
  }

  convert(): Octopus['VectorStroke'] | null {
    const dashProperties = this._parseDashProperties()
    const style = dashProperties.dashing.length ? 'DASHED' : 'SOLID'
    const colorSpaceValue = this._resources.getColorSpaceValue(this._sourceLayer.colorSpaceStroking ?? '') ?? ''

    const fill = new OctopusEffectColorFill({
      colorSpaceValue,
      sourceLayer: this._sourceLayer,
      colorSpaceType: ColorSpace.STROKING,
    }).convert()

    return {
      thickness: asNumber(this._sourceLayer.lineWidth),
      fill,
      position: 'CENTER',
      visible: true,
      style,
      lineJoin: this._lineJoin,
      lineCap: this._lineCap,
      ...(style === 'DASHED' ? dashProperties : null),
    }
  }
}
