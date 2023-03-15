import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { SourceEffectBevelEmboss } from './source-effect-bevel-emboss.js'
import { SourceEffectFill } from './source-effect-fill.js'
import { SourceEffectSatin } from './source-effect-satin.js'
import { SourceEffectShadow } from './source-effect-shadow.js'
import { SourceEffectStroke } from './source-effect-stroke.js'
import { SourceEntity } from './source-entity.js'
import PROPS from '../../utils/prop-names.js'

import type { RawlayerEffects, RawNodeChildWithType } from '../../typings/raw/index.js'

export class SourceLayerEffects extends SourceEntity {
  protected _rawValue: RawNodeChildWithType

  constructor(raw: RawNodeChildWithType) {
    super(raw)
    this._rawValue = raw
  }

  private get objectBasedEffectsLayerInfo(): RawlayerEffects | undefined {
    const { layerProperties } = this._rawValue

    return (
      layerProperties?.[PROPS.OBJECT_BASED_EFFECTS_LAYER_INFO] ??
      layerProperties?.[PROPS.MULTIPLE_OBJECT_BASED_EFFECTS] ??
      layerProperties?.[PROPS.OBJECT_BASED_UNDOCUMENTED]
    )
  }

  get enabledAll(): boolean {
    return this.objectBasedEffectsLayerInfo?.masterFXSwitch ?? false
  }

  @firstCallMemo()
  get solidFill(): SourceEffectFill | undefined {
    const fill = this.objectBasedEffectsLayerInfo?.SoFi
    return fill && fill.present !== false
      ? new SourceEffectFill(this.objectBasedEffectsLayerInfo?.[PROPS.SOLID_FILL])
      : undefined
  }

  @firstCallMemo()
  get gradientFill(): SourceEffectFill | undefined {
    const fill = this.objectBasedEffectsLayerInfo?.GrFl
    return fill && fill.present !== false
      ? new SourceEffectFill(this.objectBasedEffectsLayerInfo?.[PROPS.GRADIENT_FILL])
      : undefined
  }

  @firstCallMemo()
  get patternFill(): SourceEffectFill | undefined {
    const fill = this.objectBasedEffectsLayerInfo?.patternFill
    return fill && fill.present !== false
      ? new SourceEffectFill(this.objectBasedEffectsLayerInfo?.patternFill)
      : undefined
  }

  @firstCallMemo()
  get stroke(): SourceEffectStroke | undefined {
    const fill = this.objectBasedEffectsLayerInfo?.[PROPS.FRAME_FX]
    return fill && fill.present !== false ? new SourceEffectStroke(fill) : undefined
  }

  @firstCallMemo()
  get innerGlow(): SourceEffectShadow | undefined {
    const shadow = this.objectBasedEffectsLayerInfo?.[PROPS.INNER_GLOW]
    return shadow && shadow.present !== false ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get innerShadow(): SourceEffectShadow | undefined {
    const shadow = this.objectBasedEffectsLayerInfo?.[PROPS.INNER_SHADOW]
    return shadow && shadow.present !== false ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get outerGlow(): SourceEffectShadow | undefined {
    const shadow = this.objectBasedEffectsLayerInfo?.[PROPS.OUTER_GLOW]
    return shadow && shadow.present !== false ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get dropShadow(): SourceEffectShadow | undefined {
    const shadow = this.objectBasedEffectsLayerInfo?.[PROPS.DROP_SHADOW]
    return shadow && shadow.present !== false ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get satin(): SourceEffectSatin | undefined {
    const satin = this.objectBasedEffectsLayerInfo?.[PROPS.CHROME_FX]
    return satin && satin.present !== false ? new SourceEffectSatin(satin) : undefined
  }

  @firstCallMemo()
  get bevelEmboss(): SourceEffectBevelEmboss | undefined {
    const bevelEmboss = this.objectBasedEffectsLayerInfo?.[PROPS.BEVEL_EMBOSS]

    return bevelEmboss !== undefined && bevelEmboss.present != false
      ? new SourceEffectBevelEmboss(bevelEmboss)
      : undefined
  }
}
