import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { SourceEffectBevelEmboss } from './source-effect-bevel-emboss.js'
import { SourceEffectFill } from './source-effect-fill.js'
import { SourceEffectSatin } from './source-effect-satin.js'
import { SourceEffectShadow } from './source-effect-shadow.js'
import { SourceEffectStroke } from './source-effect-stroke.js'
import { SourceEntity } from './source-entity.js'

import type { RawlayerEffects, NodeChildWithType } from '../../typings/raw'

export class SourceLayerEffects extends SourceEntity {
  protected _rawValue: NodeChildWithType

  constructor(raw: NodeChildWithType) {
    super(raw)
    this._rawValue = raw
  }

  private get _lfx2(): RawlayerEffects | undefined {
    return this._rawValue?.layerProperties?.lfx2
  }

  get enabledAll(): boolean {
    return this._lfx2?.masterFXSwitch ?? false
  }

  @firstCallMemo()
  get solidFill(): SourceEffectFill | undefined {
    const fill = this._lfx2?.SoFi
    return fill && fill.present !== false ? new SourceEffectFill(this._lfx2?.SoFi) : undefined
  }

  @firstCallMemo()
  get gradientFill(): SourceEffectFill | undefined {
    const fill = this._lfx2?.GrFl
    return fill && fill.present !== false ? new SourceEffectFill(this._lfx2?.GrFl) : undefined
  }

  @firstCallMemo()
  get patternFill(): SourceEffectFill | undefined {
    const fill = this._lfx2?.patternFill
    return fill && fill.present !== false ? new SourceEffectFill(this._lfx2?.patternFill) : undefined
  }

  @firstCallMemo()
  get stroke(): SourceEffectStroke | undefined {
    const fill = this._lfx2?.FrFX
    return fill && fill.present !== false ? new SourceEffectStroke(fill) : undefined
  }

  @firstCallMemo()
  get innerGlow(): SourceEffectShadow | undefined {
    const shadow = this._lfx2?.IrGl
    return shadow && shadow.present !== false ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get innerShadow(): SourceEffectShadow | undefined {
    const shadow = this._lfx2?.IrSh
    return shadow && shadow.present !== false ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get outerGlow(): SourceEffectShadow | undefined {
    const shadow = this._lfx2?.OrGl
    return shadow && shadow.present !== false ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get dropShadow(): SourceEffectShadow | undefined {
    const shadow = this._lfx2?.DrSh
    return shadow && shadow.present !== false ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get satin(): SourceEffectSatin | undefined {
    const satin = this._lfx2?.ChFX
    return satin && satin.present !== false ? new SourceEffectSatin(this._lfx2?.ChFX) : undefined
  }

  @firstCallMemo()
  get bevelEmboss(): SourceEffectBevelEmboss | undefined {
    const bevelEmboss = this._lfx2?.ebbl

    return bevelEmboss !== undefined && bevelEmboss.present != false
      ? new SourceEffectBevelEmboss(bevelEmboss)
      : undefined
  }
}
