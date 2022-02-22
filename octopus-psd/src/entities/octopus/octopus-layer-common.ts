import { v4 as uuidv4 } from 'uuid'

import type { OctopusPSDConverter } from '../..'
import type { SourceLayer } from '../../factories/create-source-layer'
import { asNumber, asString } from '@avocode/octopus-common/dist/utils/as'
import { OctopusArtboard } from './octopus-artboard'
import type { OctopusLayerGroup } from './octopus-layer-group'
import { NotNull } from '@avocode/octopus-common/dist/utils/utility-types'
import type { Octopus } from '../../typings/octopus'
import { getMapped, round } from '@avocode/octopus-common/dist/utils/common'
import { BLEND_MODES } from '../../utils/blend-modes'
import { DEFAULTS } from '../../utils/defaults'
import { createDefaultTranslationMatrix } from '../../utils/path'
import { logWarn } from '../../services/instances/misc'

export type OctopusLayerParent = OctopusLayerGroup | OctopusArtboard

type OctopusLayerCommonOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer
}

export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type'>>

export class OctopusLayerCommon {
  protected _id: string
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayer

  static DEFAULT_TRANSLATION = [0, 0] as const

  static LAYER_TYPE_MAP = {
    layerSection: 'GROUP',
    shapeLayer: 'SHAPE',
    textLayer: 'TEXT',
    layer: 'SHAPE',
    // TODO: backgroundLayer: 'TODO',
  } as const

  constructor(options: OctopusLayerCommonOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer
    this._id = asString(this._sourceLayer.id, uuidv4())
  }

  get sourceLayer(): SourceLayer {
    return this._sourceLayer
  }

  get converter(): OctopusPSDConverter {
    return this.parentArtboard.converter
  }

  get parentArtboard(): OctopusArtboard {
    const parent = this._parent as OctopusLayerParent
    return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return asString(this._sourceLayer.name, 'Layer')
  }

  get visible(): boolean | undefined {
    return typeof this._sourceLayer.visible === 'boolean' ? this._sourceLayer.visible : undefined
  }

  get blendMode(): Octopus['BlendMode'] {
    const sourceBlendMode = this._sourceLayer.blendMode
    return typeof sourceBlendMode === 'string' && sourceBlendMode in BLEND_MODES
      ? BLEND_MODES[sourceBlendMode]
      : DEFAULTS.BLEND_MODE
  }

  get layerTranslation(): readonly [number, number] {
    return OctopusLayerCommon.DEFAULT_TRANSLATION
  }

  get transform(): number[] {
    return createDefaultTranslationMatrix(this.layerTranslation)
  }

  get opacity(): number {
    return round(asNumber(this._sourceLayer.opacity, 100) / 100)
  }

  get type(): Octopus['LayerBase']['type'] | null {
    const type = String(this._sourceLayer.type)
    const result = getMapped(type, OctopusLayerCommon.LAYER_TYPE_MAP, undefined)
    if (!result) {
      logWarn('Unknown Layer type', { type })
      return null
    }
    return result
  }

  get isConvertible(): boolean {
    return this.type !== null
  }

  convertCommon(): Octopus['LayerBase'] | null {
    if (!this.isConvertible) return null

    const type = this.type as NotNull<typeof this.type>

    return {
      id: this.id,
      name: this.name,
      type,
      transform: this.transform,
      visible: this.visible,
      blendMode: this.blendMode,
      opacity: this.opacity,
    }
  }
}
