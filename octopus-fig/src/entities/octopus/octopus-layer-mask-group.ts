import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { createOctopusLayer, createOctopusLayers } from '../../factories/create-octopus-layer'
import { createSourceLayer } from '../../factories/create-source-layer'
import { env } from '../../services'
import { convertId } from '../../utils/convert'
import { DEFAULTS } from '../../utils/defaults'
import { getArtboardTransform } from '../../utils/source'
import { OctopusArtboard } from './octopus-artboard'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type { RawLayerShape } from '../../typings/raw'
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
  transform?: number[]
  isArtboard?: boolean
}

type CreateBackgroundMaskGroupOptions = {
  sourceLayer: SourceLayerFrame
  parent: OctopusLayerParent
  isArtboard?: boolean
}

type CreateMaskGroupOptions = {
  mask: OctopusLayer
  layers: OctopusLayer[]
  parent: OctopusLayerParent
}

export class OctopusLayerMaskGroup {
  protected _visible: boolean
  private _parent: OctopusLayerParent
  private _id: string
  private _mask: OctopusLayer
  private _layers: OctopusLayer[]
  private _maskBasis?: Octopus['MaskBasis']
  private _maskChannels?: number[]
  private _transform?: number[]
  private _isArtboard: boolean

  static createBackgroundLayer(frame: SourceLayerFrame, parent: OctopusLayerParent): OctopusLayer | null {
    const rawLayer = { ...(frame.raw as RawLayerShape) }
    rawLayer.id = `${rawLayer.id}-BackgroundMask`
    rawLayer.type = 'RECTANGLE' as const
    delete rawLayer.relativeTransform
    const sourceLayer = createSourceLayer({ layer: rawLayer, parent: frame.parent })
    if (!sourceLayer) return null
    return createOctopusLayer({ layer: sourceLayer, parent })
  }

  static createBackgroundMaskGroup({
    sourceLayer,
    parent,
    isArtboard = false,
  }: CreateBackgroundMaskGroupOptions): OctopusLayerMaskGroup | null {
    const id = `${sourceLayer.id}-Background`
    const artboardTransform = isArtboard && env.NODE_ENV === 'debug' ? getArtboardTransform(sourceLayer) : undefined // TODO remove when ISSUE is fixed https://gitlab.avcd.cz/opendesign/open-design-engine/-/issues/21
    const transform = isArtboard ? artboardTransform : sourceLayer.transform ?? undefined
    const mask = OctopusLayerMaskGroup.createBackgroundLayer(sourceLayer, parent)
    if (!mask) return null
    const maskBasis = sourceLayer.clipsContent ? 'BODY_EMBED' : 'SOLID'
    const layers = createOctopusLayers(sourceLayer.layers, parent)
    const visible = sourceLayer.visible
    return new OctopusLayerMaskGroup({ id, mask, maskBasis, layers, transform, parent, isArtboard, visible })
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
    this._transform = options.transform
    this._isArtboard = options.isArtboard ?? false
  }

  get id(): string {
    return convertId(this._id)
  }

  get transform(): number[] {
    return this._transform ?? DEFAULTS.TRANSFORM
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

  get layers(): OctopusLayer[] {
    return this._layers
  }

  get meta(): Octopus['LayerMeta'] | undefined {
    const isArtboard = this._isArtboard
    return isArtboard ? { isArtboard } : undefined
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
      visible: this.visible,
      meta: this.meta,
    } as const
  }
}
