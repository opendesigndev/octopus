import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { convertId, convertRectangle } from '../../utils/convert'
import { DEFAULTS } from '../../utils/defaults'
import { OctopusArtboard } from './octopus-artboard'
import { OctopusFill } from './octopus-fill'
import { OctopusStroke } from './octopus-stroke'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type { SourceLayerFrame } from '../source/source-layer-frame'
import type { OctopusLayerParent } from './octopus-layer-base'

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  id: string
  mask: OctopusLayer
  maskBasis?: Octopus['MaskBasis']
  maskChannels?: number[]
  layers: OctopusLayer[]
  visible?: boolean
}

type CreateBackgroundOptions = {
  frame: SourceLayerFrame
  layers: OctopusLayer[]
  isArtboard?: boolean
}

type CreateMaskGroupOptions = {
  mask: OctopusLayer
  layers: OctopusLayer[]
  parent: OctopusLayerParent
}

export class OctopusLayerMaskGroup {
  private _parent: OctopusLayerParent
  private _id: string
  private _mask: OctopusLayer
  private _maskBasis: Octopus['MaskBasis'] | undefined
  private _maskChannels: number[] | undefined
  private _layers: OctopusLayer[]
  protected _visible: boolean

  static createBackgroundMask(frame: SourceLayerFrame): Octopus['Layer'] | null {
    if (!frame.size) return null

    const id = convertId(frame.id)
    const rectangle = convertRectangle(frame.size)
    const cornerRadius = frame.cornerRadius
    const fills = OctopusFill.convertFills(frame.fills, frame)
    const strokes = OctopusStroke.convertStrokes(frame.strokes, frame)
    return {
      id: `${id}-BackgroundMask`,
      type: 'SHAPE' as const,
      visible: fills.length > 0 || strokes.length > 0,
      shape: { path: { type: 'RECTANGLE', rectangle, cornerRadius }, fills, strokes },
    }
  }

  static createBackground({
    frame,
    layers,
    isArtboard = false,
  }: CreateBackgroundOptions): Octopus['MaskGroupLayer'] | null {
    const id = convertId(frame.id)
    const mask = OctopusLayerMaskGroup.createBackgroundMask(frame)
    if (!mask) return null

    const meta = isArtboard ? { isArtboard } : undefined
    const visible = true // TODO
    return {
      id: `${id}-Background`,
      type: 'MASK_GROUP',
      maskBasis: 'BODY',
      mask,
      layers: getConverted(layers),
      meta,
      visible,
    }
  }

  static createClippingMask({ mask, layers, parent }: CreateMaskGroupOptions): OctopusLayerMaskGroup | null {
    const id = `${mask.id}-ClippingMask`
    const maskBasis = 'LAYER_AND_EFFECTS'
    mask.visible = false
    return new OctopusLayerMaskGroup({ id, parent, mask, layers, maskBasis })
  }

  static createClippingMaskOutline({ mask, layers, parent }: CreateMaskGroupOptions): OctopusLayerMaskGroup | null {
    const id = `${mask.id}-ClippingMask`
    const maskBasis = 'BODY'
    mask.visible = false
    return new OctopusLayerMaskGroup({ id, parent, mask, layers, maskBasis })
  }

  constructor(options: OctopusLayerMaskGroupOptions) {
    this._id = options.id
    this._mask = options.mask
    this._maskBasis = options.maskBasis
    this._maskChannels = options.maskChannels
    this._layers = options.layers
    this._visible = options.visible ?? true
  }

  get id(): string {
    return convertId(this._id)
  }

  get transform(): number[] {
    return DEFAULTS.TRANSFORM
  }

  get maskBasis(): Octopus['MaskBasis'] {
    return this._maskBasis ?? 'BODY'
  }

  get maskChannels(): number[] | undefined {
    return this._maskChannels
  }

  get mask(): OctopusLayer {
    return this._mask
  }

  get parentArtboard(): OctopusArtboard {
    const parent = this._parent as OctopusLayerParent
    return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
  }

  get type(): 'MASK_GROUP' {
    return 'MASK_GROUP'
  }

  get visible(): boolean {
    return this._visible
  }

  set visible(isVisible: boolean) {
    this._visible = isVisible
  }

  convert(): Octopus['MaskGroupLayer'] | null {
    const mask = this.mask.convert()
    if (!mask) return null

    return {
      id: this.id,
      type: this.type,
      maskBasis: this.maskBasis,
      maskChannels: this.maskChannels,
      mask,
      transform: this.transform,
      layers: getConverted(this._layers),
    } as const
  }
}
