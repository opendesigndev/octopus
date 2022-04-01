import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { logWarn } from '../../services/instances/misc'
import type { Octopus } from '../../typings/octopus'
import type { SourceEffectStroke } from '../source/source-effect-stroke'
import { OctopusEffectBase } from './octopus-effect-base'
import { OctopusEffectFill } from './octopus-effect-fill'
import type { OctopusLayerBase } from './octopus-layer-base'

type OctopusEffectStrokeOptions = {
  parentLayer: OctopusLayerBase
  effect: SourceEffectStroke
}

export class OctopusEffectStroke extends OctopusEffectBase {
  protected _parentLayer: OctopusLayerBase
  private _stroke: SourceEffectStroke

  static STROKE_POSITION_MAP = {
    centeredFrame: 'CENTER',
    insetFrame: 'INSIDE',
    outsetFrame: 'OUTSIDE',
  } as const

  constructor(options: OctopusEffectStrokeOptions) {
    super(options)
    this._parentLayer = options.parentLayer
    this._stroke = options.effect
  }

  private get _position(): 'CENTER' | 'INSIDE' | 'OUTSIDE' | null {
    const lineAlignment = this._stroke.lineAlignment
    const result = getMapped(lineAlignment, OctopusEffectStroke.STROKE_POSITION_MAP, undefined)
    if (!result) {
      logWarn('Unknown Stroke position', { lineAlignment, stroke: this._stroke })
      return null
    }
    return result
  }

  @firstCallMemo()
  private get _fill(): Octopus['Fill'] | null {
    const parentLayer = this._parentLayer
    const fill = this._stroke.fill
    return new OctopusEffectFill({ parentLayer, fill }).convert()
  }

  get stroke(): Octopus['Stroke'] | null {
    const thickness = this._stroke.lineWidth
    const position = this._position
    const fill = this._fill
    if (thickness === null) return null
    if (position === null) return null
    if (fill === null) return null
    return { thickness, position, fill }
  }

  convert(): Octopus['EffectStroke'] | null {
    if (!this._stroke.enabled) return null
    const stroke = this.stroke
    if (stroke === null) return null
    const visible = this.visible
    const blendMode = this.blendMode
    return { type: 'STROKE', stroke, visible, blendMode, basis: 'BODY_PLUS_STROKES' }
  }
}
