// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { asString } from '@opendesign/octopus-common/dist/utils/as.js'
import { getMapped, push } from '@opendesign/octopus-common/dist/utils/common.js'
import { v4 as uuidv4 } from 'uuid'

import { OctopusComponent } from './octopus-component.js'
import { OctopusEffect } from './octopus-effect.js'
import { logger } from '../../services/index.js'
import { convertLayerBlendMode, convertId, normalizeTransform } from '../../utils/convert.js'

import type { OctopusLayerGroup } from './octopus-layer-group.js'
import type { OctopusLayerMaskGroup } from './octopus-layer-mask-group.js'
import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { Octopus } from '../../typings/octopus.js'
import type { NotNull } from '@opendesign/octopus-common/dist/utility-types.js'

export type OctopusLayerParent = OctopusLayerGroup | OctopusLayerMaskGroup | OctopusComponent

type OctopusLayerBaseOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer
}

export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type' | 'meta'>>

export class OctopusLayerBase {
  protected _id: string
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayer
  protected _visible: boolean

  static DEFAULT_TRANSLATION = [0, 0] as const

  static LAYER_TYPE_MAP = {
    FRAME: 'GROUP',
    SHAPE: 'SHAPE',
    TEXT: 'TEXT',
  } as const

  constructor(options: OctopusLayerBaseOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer
    this._visible = this._sourceLayer.visible
    this._id = asString(this._sourceLayer.id, uuidv4())
  }

  get sourceLayer(): SourceLayer {
    return this._sourceLayer
  }

  private _isTopLayer(parent: OctopusLayerParent): parent is OctopusComponent {
    return parent instanceof OctopusComponent
  }

  get parentComponent(): OctopusComponent {
    return this._isTopLayer(this._parent) ? this._parent : this._parent.parentComponent
  }

  get isTopLayer(): boolean {
    return this._isTopLayer(this._parent)
  }

  get id(): string {
    return convertId(this._id)
  }

  get name(): string {
    return asString(this._sourceLayer.name, 'Layer')
  }

  get visible(): boolean {
    return this._visible
  }

  set visible(isVisible: boolean) {
    this._visible = isVisible
  }

  get blendMode(): Octopus['BlendMode'] {
    const { isFrameLike } = this._sourceLayer
    const blendMode = convertLayerBlendMode(this._sourceLayer.blendMode, { isFrameLike })

    if (blendMode === 'PASS_THROUGH') {
      const hasBlur = this._sourceLayer.effects.some((effect) => effect.type === 'LAYER_BLUR')
      if (hasBlur) return 'NORMAL' // https://github.com/opendesigndev/open-design-engine/issues/11
    }

    return blendMode
  }

  get transform(): number[] {
    return normalizeTransform(this.sourceLayer.transform)
  }

  get opacity(): number {
    return this._sourceLayer.opacity
  }

  get type(): Octopus['LayerBase']['type'] | null {
    const type = String(this._sourceLayer.type)
    const result = getMapped(type, OctopusLayerBase.LAYER_TYPE_MAP, undefined)
    if (!result) {
      logger?.warn('Unknown Layer type', { type })
      return null
    }
    return result
  }

  get isConvertible(): boolean {
    return this.type !== null
  }

  @firstCallMemo()
  get effects(): Octopus['Effect'][] {
    return this.sourceLayer.effects.reduce((effects, sourceEffect) => {
      const effect = new OctopusEffect(sourceEffect).convert()
      return effect ? push(effects, effect) : effects
    }, [])
  }

  convertBase(): Octopus['LayerBase'] | null {
    if (!this.isConvertible) return null

    const type = this.type as NotNull<typeof this.type>

    return {
      id: this.id,
      name: this.name,
      type,
      visible: this.visible,
      opacity: this.opacity,
      blendMode: this.blendMode,
      transform: this.transform,
      effects: this.effects,
    }
  }
}
