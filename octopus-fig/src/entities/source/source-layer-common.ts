import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { push } from '@avocode/octopus-common/dist/utils/common'
import { round } from '@avocode/octopus-common/dist/utils/math'

import { DEFAULTS } from '../../utils/defaults'
import { getSizeFor, getTransformFor } from '../../utils/source'
import { SourceArtboard } from './source-artboard'
import { SourceEffect } from './source-effect-fill'
import { SourceEntity } from './source-entity'
import { SourcePaint } from './source-paint'

import type { Octopus } from '../../typings/octopus'
import type { RawAlign, RawBlendMode, RawLayer } from '../../typings/raw'
import type { SourceTransform } from '../../typings/source'
import type { SourceLayerFrame } from './source-layer-frame'
import type { SourceLayerShape } from './source-layer-shape'

export type SourceLayerParent = SourceArtboard | SourceLayerFrame | SourceLayerShape

type SourceLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayer
}

export class SourceLayerCommon extends SourceEntity {
  protected _rawValue: RawLayer
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerOptions) {
    super(options.rawValue)
    this._parent = options.parent
  }

  get id(): string | undefined {
    return this._rawValue.id
  }

  get name(): string | undefined {
    return this._rawValue.name
  }

  get parent(): SourceLayerParent {
    return this._parent
  }

  get parentArtboard(): SourceArtboard {
    const parent = this._parent
    return parent instanceof SourceArtboard ? parent : parent.parentArtboard
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

  get transform(): SourceTransform | null {
    return getTransformFor(this._rawValue.relativeTransform)
  }

  @firstCallMemo()
  get fills(): SourcePaint[] {
    return this._rawValue.fills?.map((paint) => new SourcePaint({ rawValue: paint })) ?? []
  }

  @firstCallMemo()
  get strokes(): SourcePaint[] {
    return this._rawValue.strokes?.map((paint) => new SourcePaint({ rawValue: paint })) ?? []
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
    return this._rawValue.cornerRadius
  }

  get strokeWeight(): number {
    return this._rawValue.strokeWeight ?? 0
  }

  get strokeAlign(): RawAlign {
    return this._rawValue.strokeAlign ?? DEFAULTS.STROKE_ALIGN
  }

  get isMask(): boolean {
    return this._rawValue.isMask ?? false
  }

  get isMaskOutline(): boolean {
    return this._rawValue.isMaskOutline ?? false
  }
}
