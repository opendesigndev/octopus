import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { logWarn } from '../../services/instances/misc'
import { OctopusEffectFill } from './octopus-fill'
import { OctopusPath } from './octopus-path'

import type { Octopus } from '../../typings/octopus'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourcePaint } from '../source/source-paint'

type OctopusStrokeOptions = {
  sourceLayer: SourceLayerShape
  fill: SourcePaint
}

export class OctopusStroke {
  protected _sourceLayer: SourceLayerShape
  private _fill: SourcePaint
  protected _path: OctopusPath

  static STROKE_ALIGNS = ['CENTER', 'INSIDE', 'OUTSIDE']

  static STROKE_JOINS = ['MITER', 'BEVEL', 'ROUND']

  static STROKE_CAP_MAP = {
    NONE: 'BUTT',
    ROUND: 'ROUND',
    SQUARE: 'SQUARE',
  } as const

  constructor(options: OctopusStrokeOptions) {
    this._sourceLayer = options.sourceLayer
    this._fill = options.fill
    this._path = new OctopusPath({ sourceLayer: options.sourceLayer, isStroke: true })
  }

  get position(): 'CENTER' | 'INSIDE' | 'OUTSIDE' | null {
    const strokeAlign = this._sourceLayer.strokeAlign
    if (!OctopusStroke.STROKE_ALIGNS.some((align) => align === strokeAlign)) {
      logWarn('Unknown Stroke Align', { strokeAlign })
      return null
    }
    return strokeAlign
  }

  get lineCap(): 'BUTT' | 'ROUND' | 'SQUARE' | null {
    const strokeCap = this._sourceLayer.strokeCap
    const result = getMapped(strokeCap, OctopusStroke.STROKE_CAP_MAP, undefined)
    if (!result) {
      logWarn('Unknown Stroke Cap', { strokeCap })
      return null
    }
    return result
  }

  get lineJoin(): 'ROUND' | 'MITER' | 'BEVEL' | null {
    const strokeJoin = this._sourceLayer.strokeJoin
    if (!OctopusStroke.STROKE_JOINS.some((join) => join === strokeJoin)) {
      logWarn('Unknown Stroke join', { strokeJoin })
      return null
    }
    return strokeJoin
  }

  @firstCallMemo()
  get fill(): Octopus['Fill'] | null {
    return new OctopusEffectFill({ fill: this._fill, parentLayer: this._sourceLayer }).convert()
  }

  get style(): Octopus['VectorStroke']['style'] {
    return this.dashing.length === 0 ? 'SOLID' : 'DASHED'
  }

  get dashing(): number[] {
    return this._sourceLayer.strokeDashes ?? []
  }

  get visible(): boolean {
    return this._fill.visible
  }

  get thickness(): number {
    return this._sourceLayer.strokeWeight
  }

  get miterLimit(): number {
    return this._sourceLayer.strokeMiterAngle
  }

  get path(): Octopus['PathLike'] {
    return this._path.convert()
  }

  get fillRule(): Octopus['FillRule'] {
    return this._path.fillRule
  }

  convert(): Octopus['VectorStroke'] | null {
    const fill = this.fill
    const position = this.position
    const lineJoin = this.lineJoin
    const lineCap = this.lineCap

    if (fill === null) return null
    if (position === null) return null
    if (lineJoin === null) return null
    if (lineCap === null) return null

    const style = this.style
    const dashing = this.dashing
    const visible = this.visible
    const thickness = this.thickness
    const miterLimit = this.miterLimit
    const path = this.path
    const fillRule = this.fillRule

    return { style, dashing, visible, fill, thickness, position, lineJoin, lineCap, miterLimit, fillRule, path }
  }
}
