import { asNumber, asString } from '@avocode/octopus-common/dist/utils/as'
import { round } from '@avocode/octopus-common/dist/utils/math'
import { v4 as uuidv4 } from 'uuid'

import BLEND_MODES from '../../utils/blend-modes'
import DEFAULTS from '../../utils/defaults'
import { convertObjectMatrixToArray } from '../../utils/matrix'
import { createMatrix } from '../../utils/paper'
import OctopusArtboard from './octopus-artboard'
import OctopusEffectsLayer from './octopus-effects-layer'

import type { OctopusXDConverter } from '../..'
import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { Raw3DMatrix } from '../../typings/source'
import type OctopusLayerGroup from './octopus-layer-group'
import type OctopusLayerMaskGroup from './octopus-layer-maskgroup'

type OctopusLayerCommonOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer
}

export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type'>>
export default class OctopusLayerCommon {
  protected _id: string
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayer

  static LAYER_TYPES = {
    shape: 'SHAPE',
    group: 'GROUP',
    text: 'TEXT',
  } as const

  constructor(options: OctopusLayerCommonOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer

    this._id = asString(this._sourceLayer.id, uuidv4())
  }

  get sourceLayer(): SourceLayer {
    return this._sourceLayer
  }

  get converter(): OctopusXDConverter | null {
    const parentArtboard = this.parentArtboard
    if (!parentArtboard) return null
    return parentArtboard.converter
  }

  get parentArtboard(): OctopusArtboard | null {
    if (!this._parent) return null
    const parent = this._parent as OctopusLayerGroup | OctopusArtboard
    return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
  }

  get parent(): OctopusLayerParent {
    return this._parent
  }

  get parents(): (OctopusArtboard | OctopusLayer | OctopusLayerMaskGroup)[] {
    const parent = this._parent
    if (!parent) return []
    return parent instanceof OctopusArtboard ? [parent] : [...parent.parents, parent]
  }

  get parentLayers(): OctopusLayer[] {
    const parent = this._parent
    if (!parent || parent instanceof OctopusArtboard) return []
    return [...parent.parentLayers, parent]
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return asString(this._sourceLayer.name, DEFAULTS.LAYER.NAME)
  }

  get visible(): boolean | undefined {
    return typeof this._sourceLayer.visible === 'boolean' ? this._sourceLayer.visible : undefined
  }

  get blendMode(): typeof BLEND_MODES[keyof typeof BLEND_MODES] {
    const sourceBlendMode = this._sourceLayer.blendMode
    return typeof sourceBlendMode === 'string' && sourceBlendMode in BLEND_MODES
      ? BLEND_MODES[sourceBlendMode]
      : DEFAULTS.BLEND_MODE
  }

  get transform(): Octopus['Transform'] {
    const matrixAsArray = this._sourceLayer.transform
      ? convertObjectMatrixToArray(this._sourceLayer.transform)
      : DEFAULTS.TRANSFORM.slice()

    const [a, b, c, d, tx, ty] = matrixAsArray || DEFAULTS.TRANSFORM.slice()

    return createMatrix(a, b, c, d, tx, ty).values
  }

  get opacity(): number {
    return round(asNumber(this._sourceLayer.opacity, 1))
  }

  get type(): 'SHAPE' | 'GROUP' | 'TEXT' | null {
    const type = String(this._sourceLayer.type).toLowerCase()
    if (!(type in OctopusLayerCommon.LAYER_TYPES)) {
      const converter = this.converter
      if (converter) {
        converter.sentry?.captureMessage('Unknown layer type', { extra: { type } })
      }
      return null
      // throw new Error(`Invalid layer property "type": "${this._sourceLayer.type}"`)
    }
    return OctopusLayerCommon.LAYER_TYPES[type as keyof typeof OctopusLayerCommon.LAYER_TYPES]
  }

  get isFixed(): boolean | undefined {
    return typeof this._sourceLayer.fixed === 'boolean' ? this._sourceLayer.fixed : undefined
  }

  has3dMatrix(): boolean {
    return typeof (this._sourceLayer.transform as Raw3DMatrix)?.[0]?.[0] === 'number'
  }

  isConvertible(): boolean {
    const hasValidType = this.type !== null
    const has3dMatrix = this.has3dMatrix()
    return hasValidType && !has3dMatrix
  }

  effects(): OctopusEffectsLayer {
    return new OctopusEffectsLayer({
      sourceLayer: this._sourceLayer,
    })
  }

  convertCommon(): Omit<Octopus['LayerBase'], 'type'> | null {
    if (!this.isConvertible()) return null

    const effectsArray = this.effects().convert()
    const effects = effectsArray.length ? { effects: effectsArray } : null

    return {
      id: this.id,
      name: this.name,
      transform: this.transform,
      visible: this.visible,
      blendMode: this.blendMode,
      opacity: this.opacity,
      ...effects,
    }
  }
}
