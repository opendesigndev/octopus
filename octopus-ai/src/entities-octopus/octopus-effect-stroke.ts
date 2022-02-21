import { asNumber } from '@avocode/octopus-common/dist/utils/as'

import OctopusEffectColorFill, { ColorSpace } from './octopus-effect-color-fill'

import type SourceLayerShape from '../entities-source/source-layer-shape'
import type SourceResources from '../entities-source/source-resources'
import type { Octopus } from '../typings/octopus'

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

  // private _getColorSpaceNonStroking(){
  //     const colorSpaceNonStroking = this._sourceLayer.colorSpaceNonStroking
  //     return this._resources.getColorSpaceValue(colorSpaceNonStroking)
  //  }

  private _parseDashing() {
    const dashing = this._sourceLayer.dashing
    const dashOffset = this._sourceLayer.dashOffset

    return { dashing, dashOffset }
  }

  private get _lineJoin(): LineJoin {
    return OctopusEffectStroke.LINE_JOIN_MAP[this._sourceLayer.lineJoin]
  }

  private get _lineCap() {
    return OctopusEffectStroke.LINE_CAP_MAP[this._sourceLayer.lineJoin]
  }

  convert(): Octopus['VectorStroke'] | null {
    const dashProperties = this._parseDashing()
    const style = dashProperties.dashing ? 'DASHED' : 'SOLID'
    const fill = new OctopusEffectColorFill({
      resources: this._resources,
      sourceLayer: this._sourceLayer,
      colorSpaceType: ColorSpace.COLOR_SPACE_STROKING,
    }).convert()

    return {
      thickness: asNumber(this._sourceLayer.lineWidth),
      fill,
      position: 'CENTER',
      visible: true,
      style,
      lineJoin: this._lineJoin,
      lineCap: this._lineCap,
      ...dashProperties,
    }
  }
}
