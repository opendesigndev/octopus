import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo'
import { push } from '@opendesign/octopus-common/dist/utils/common'
import { round } from '@opendesign/octopus-common/dist/utils/math'
import { v4 as uuid } from 'uuid'

import { DEFAULTS } from '../../utils/defaults'
import { getGeometryFor, getSizeFor, getTransformFor } from '../../utils/source'
import { SourceComponent } from './source-component'
import { SourceEffect } from './source-effect'
import { SourceEntity } from './source-entity'
import { SourcePaint } from './source-paint'

import type { Octopus } from '../../typings/octopus'
import type { RawAlign, RawBlendMode, RawLayer, RawStrokeCap, RawStrokeJoin } from '../../typings/raw'
import type { SourceGeometry, SourceTransform } from '../../typings/source'
import type { SourceLayerFrame } from './source-layer-frame'
import type { SourceLayerShape } from './source-layer-shape'

export type SourceLayerParent = SourceComponent | SourceLayerFrame | SourceLayerShape

type SourceLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayer
}

export const FRAME_TYPES = ['FRAME', 'GROUP', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE'] as const
export type FrameTypes = typeof FRAME_TYPES[number]

export class SourceLayerCommon extends SourceEntity {
  protected _rawValue: RawLayer
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerOptions) {
    super(options.rawValue)
    this._parent = options.parent
  }

  get id(): string {
    return this._rawValue.id ?? uuid()
  }

  get name(): string | undefined {
    return this._rawValue.name
  }

  get parent(): SourceLayerParent {
    return this._parent
  }

  get parentComponent(): SourceComponent {
    const parent = this._parent
    return parent instanceof SourceComponent ? parent : parent.parentComponent
  }

  get visible(): boolean {
    return this._rawValue.visible ?? true
  }

  get opacity(): number {
    return round(this._rawValue.opacity ?? 1)
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue.blendMode
  }

  get isFrameLike(): boolean {
    return (FRAME_TYPES as readonly string[]).includes(this._rawValue.type ?? '')
  }

  get transform(): SourceTransform | null {
    return getTransformFor(this._rawValue.relativeTransform)
  }

  get hasBackgroundMask(): boolean {
    return false
  }

  @firstCallMemo()
  get fills(): SourcePaint[] {
    return this._rawValue.fills?.map((paint) => new SourcePaint({ rawValue: paint })) ?? []
  }

  @firstCallMemo()
  get strokes(): SourcePaint[] {
    return this._rawValue.strokes?.map((paint) => new SourcePaint({ rawValue: paint })) ?? []
  }

  get fillGeometry(): SourceGeometry[] {
    return getGeometryFor(this._rawValue.fillGeometry)
  }

  get strokeGeometry(): SourceGeometry[] {
    return getGeometryFor(this._rawValue.strokeGeometry)
  }

  get strokeWeight(): number {
    return this._rawValue.strokeWeight ?? 0
  }

  get strokeAlign(): RawAlign {
    return this._rawValue.strokeAlign ?? DEFAULTS.STROKE_ALIGN
  }

  get strokeCap(): RawStrokeCap {
    return this._rawValue.strokeCap ?? DEFAULTS.STROKE_CAP
  }

  get strokeJoin(): RawStrokeJoin {
    return this._rawValue.strokeJoin ?? DEFAULTS.STROKE_JOIN
  }

  get strokeDashes(): number[] {
    return this._rawValue.strokeDashes ?? []
  }

  get strokeMiterAngle(): number {
    return this._rawValue.strokeMiterAngle ?? DEFAULTS.STROKE_MITER_ANGLE
  }

  get effects(): SourceEffect[] {
    const effects = this._rawValue.effects ?? []
    return effects.reduce((effects, rawEffect) => {
      const sourceEffect = new SourceEffect(rawEffect)
      return sourceEffect ? push(effects, sourceEffect) : effects
    }, [])
  }

  get size(): Octopus['Vec2'] | null {
    return getSizeFor(this._rawValue.size)
  }

  get cornerRadius(): number | undefined {
    const radius = this._rawValue.cornerRadius
    return typeof radius === 'number' && radius ? radius : undefined
  }

  get cornerRadii(): number[] | undefined {
    return this._rawValue.rectangleCornerRadii
  }

  get isMask(): boolean {
    return this._rawValue.isMask ?? false
  }

  get isMaskOutline(): boolean {
    return this._rawValue.isMaskOutline ?? false
  }

  get isArtboard(): boolean | undefined {
    if (this._rawValue.parent?.type) return this._rawValue.parent?.type === 'PAGE'
    return this.parent instanceof SourceComponent
  }
}
