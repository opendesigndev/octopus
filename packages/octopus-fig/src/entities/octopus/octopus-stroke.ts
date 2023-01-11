import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo'
import { getMapped, push } from '@opendesign/octopus-common/dist/utils/common'

import { logger } from '../../services'
import { DEFAULTS } from '../../utils/defaults'
import { OctopusFill } from './octopus-fill'
import { OctopusPath } from './octopus-path'

import type { Octopus } from '../../typings/octopus'
import type { SourceLayerContainer } from '../source/source-layer-container'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourceLayerText } from '../source/source-layer-text'
import type { SourcePaint } from '../source/source-paint'

type SourceLayer = SourceLayerShape | SourceLayerText | SourceLayerContainer

type OctopusStrokeOptions = {
  sourceLayer: SourceLayer
  fill: SourcePaint
}

export class OctopusStroke {
  protected _sourceLayer: SourceLayer
  private _fill: SourcePaint
  protected _path: OctopusPath

  static STROKE_ALIGNS = ['CENTER', 'INSIDE', 'OUTSIDE']

  static STROKE_JOINS = ['MITER', 'BEVEL', 'ROUND']

  static STROKE_CAP_MAP = {
    NONE: 'BUTT',
    ROUND: 'ROUND',
    SQUARE: 'SQUARE',
  } as const

  static convertStrokes(strokes: SourcePaint[], sourceLayer: SourceLayer): Octopus['VectorStroke'][] {
    return strokes.reduce((strokes: Octopus['VectorStroke'][], fill: SourcePaint) => {
      const stroke = new OctopusStroke({ fill, sourceLayer }).convert()
      return stroke ? push(strokes, stroke) : strokes
    }, [])
  }

  constructor(options: OctopusStrokeOptions) {
    this._sourceLayer = options.sourceLayer
    this._fill = options.fill
    this._path = new OctopusPath({ sourceLayer: options.sourceLayer, isStroke: true })
  }

  get position(): 'CENTER' | 'INSIDE' | 'OUTSIDE' | null {
    const strokeAlign = this._sourceLayer.strokeAlign
    if (!OctopusStroke.STROKE_ALIGNS.includes(strokeAlign)) {
      logger?.warn('Unknown Stroke Align', { strokeAlign })
      return null
    }
    return strokeAlign
  }

  get lineCap(): 'BUTT' | 'ROUND' | 'SQUARE' {
    const strokeCap = this._sourceLayer.strokeCap
    const result = getMapped(strokeCap, OctopusStroke.STROKE_CAP_MAP, undefined)
    if (!result) {
      logger?.warn('Unknown Stroke Cap', { strokeCap })
      return DEFAULTS.STROKE_LINE_CAP
    }
    return result
  }

  get lineJoin(): 'ROUND' | 'MITER' | 'BEVEL' | null {
    const strokeJoin = this._sourceLayer.strokeJoin
    if (!OctopusStroke.STROKE_JOINS.includes(strokeJoin)) {
      logger?.warn('Unknown Stroke join', { strokeJoin })
      return null
    }
    return strokeJoin
  }

  @firstCallMemo()
  get fill(): Octopus['Fill'] | null {
    return new OctopusFill({ fill: this._fill, parentLayer: this._sourceLayer }).convert()
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

  get path(): Octopus['PathLike'] | undefined {
    const converted = this._path.convert() as Octopus['Path']
    return converted.geometry ? converted : undefined
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
