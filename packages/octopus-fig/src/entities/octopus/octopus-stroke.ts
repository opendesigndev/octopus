// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { getMapped, getConvertedAsync } from '@opendesign/octopus-common/dist/utils/common.js'

import { OctopusFill } from './octopus-fill.js'
import { OctopusPath } from './octopus-path.js'
import { logger } from '../../services/index.js'
import { DEFAULTS } from '../../utils/defaults.js'

import type { OctopusLayer } from '../../factories/create-octopus-layer.js'
import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceLayerShape } from '../source/source-layer-shape.js'
import type { SourcePaint } from '../source/source-paint.js'

type OctopusStrokeOptions = {
  parentLayer: OctopusLayer
  fill: SourcePaint
}

export class OctopusStroke {
  protected _parentLayer: OctopusLayer
  private _fill: SourcePaint
  protected _path: OctopusPath

  static STROKE_ALIGNS = ['CENTER', 'INSIDE', 'OUTSIDE']

  static STROKE_JOINS = ['MITER', 'BEVEL', 'ROUND']

  static STROKE_CAP_MAP = {
    NONE: 'BUTT',
    ROUND: 'ROUND',
    SQUARE: 'SQUARE',
  } as const

  static convertStrokes(strokes: SourcePaint[], parentLayer: OctopusLayer): Promise<Octopus['VectorStroke'][]> {
    const octopusStrokes = strokes.map((fill) => new OctopusStroke({ fill, parentLayer }))
    return getConvertedAsync(octopusStrokes)
  }

  constructor(options: OctopusStrokeOptions) {
    this._parentLayer = options.parentLayer
    this._fill = options.fill
    this._path = new OctopusPath({ sourceLayer: options.parentLayer.sourceLayer, isStroke: true })
  }

  get sourceLayer(): SourceLayer {
    return this._parentLayer.sourceLayer
  }

  get position(): 'CENTER' | 'INSIDE' | 'OUTSIDE' | null {
    const sourceShapeType = (this.sourceLayer as SourceLayerShape).shapeType
    if (sourceShapeType === 'LINE' || sourceShapeType === 'VECTOR') return 'CENTER' // https://github.com/opendesigndev/octopus/issues/113

    const strokeAlign = this.sourceLayer.strokeAlign
    if (!OctopusStroke.STROKE_ALIGNS.includes(strokeAlign)) {
      logger?.warn('Unknown Stroke Align', { strokeAlign })
      return null
    }
    return strokeAlign
  }

  get lineCap(): 'BUTT' | 'ROUND' | 'SQUARE' {
    const strokeCap = this.sourceLayer.strokeCap
    const result = getMapped(strokeCap, OctopusStroke.STROKE_CAP_MAP, undefined)
    if (!result) {
      logger?.warn('Unknown Stroke Cap', { strokeCap })
      return DEFAULTS.STROKE_LINE_CAP
    }
    return result
  }

  get lineJoin(): 'ROUND' | 'MITER' | 'BEVEL' | null {
    const strokeJoin = this.sourceLayer.strokeJoin
    if (!OctopusStroke.STROKE_JOINS.includes(strokeJoin)) {
      logger?.warn('Unknown Stroke join', { strokeJoin })
      return null
    }
    return strokeJoin
  }

  @firstCallMemo()
  async fill(): Promise<Octopus['Fill'] | null> {
    return new OctopusFill({ fill: this._fill, parentLayer: this._parentLayer }).convert()
  }

  get style(): Octopus['VectorStroke']['style'] {
    return this.dashing.length === 0 ? 'SOLID' : 'DASHED'
  }

  get dashing(): number[] {
    return this.sourceLayer.strokeDashes ?? []
  }

  get visible(): boolean {
    return this._fill.visible
  }

  get thickness(): number {
    return this.sourceLayer.strokeWeight
  }

  get miterLimit(): number {
    return this.sourceLayer.strokeMiterAngle
  }

  get path(): Octopus['PathLike'] | undefined {
    const converted = this._path.convert() as Octopus['Path']
    return converted.geometry ? converted : undefined
  }

  get fillRule(): Octopus['FillRule'] {
    return this._path.fillRule
  }

  async convert(): Promise<Octopus['VectorStroke'] | null> {
    const fill = await this.fill()
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
