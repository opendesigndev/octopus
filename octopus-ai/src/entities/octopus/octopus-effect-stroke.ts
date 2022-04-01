import { asNumber } from '@avocode/octopus-common/dist/utils/as'

import type { Octopus } from '../../typings/octopus'
import type SourceLayerShape from '../source/source-layer-shape'
import type SourceResources from '../source/source-resources'
import OctopusEffectColorFill, { ColorSpace } from './octopus-effect-color-fill'

type OctopusEffectStrokeOptions = {
  resources: SourceResources
  sourceLayer: SourceLayerShape
}

type LineJoin = 'MITER' | 'ROUND' | 'BEVEL'

export default class OctopusEffectStroke {
  private _resources: SourceResources
  private _sourceLayer: SourceLayerShape

  static LINE_JOIN_MAP = ['MITER', 'ROUND', 'BEVEL'] as const
  static LINE_CAP_MAP = ['BUTT', 'ROUND', 'SQUARE'] as const

  constructor(options: OctopusEffectStrokeOptions) {
    this._resources = options.resources
    this._sourceLayer = options.sourceLayer
  }

  private _parseDashing(): number[] {
    const dashing = [...this._sourceLayer.dashing]

    if (dashing.length === 1) {
      dashing.push(dashing[0])
    }

    return dashing
  }

  private get _lineJoin(): LineJoin {
    return OctopusEffectStroke.LINE_JOIN_MAP[this._sourceLayer.lineJoin]
  }

  private get _lineCap() {
    return OctopusEffectStroke.LINE_CAP_MAP[this._sourceLayer.lineCap]
  }

  convert(): Octopus['VectorStroke'] | null {
    const dashing = this._parseDashing()
    const style = dashing.length ? 'DASHED' : 'SOLID'
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
      dashing,
    }
  }
}
