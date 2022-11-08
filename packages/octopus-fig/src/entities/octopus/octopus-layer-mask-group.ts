import { getConverted } from '@opendesign/octopus-common/dist/utils/common'

import { createOctopusLayer, createOctopusLayers } from '../../factories/create-octopus-layer'
import { createSourceLayer } from '../../factories/create-source-layer'
import { env } from '../../services'
import { convertId, convertLayerBlendMode } from '../../utils/convert'
import { DEFAULTS } from '../../utils/defaults'
import { getTopComponentTransform } from '../../utils/source'
import { OctopusComponent } from './octopus-component'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type { RawBlendMode, RawLayerShape } from '../../typings/raw'
import type { SourceLayerFrame } from '../source/source-layer-frame'
import type { OctopusLayerParent } from './octopus-layer-base'

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  id: string
  name?: string
  mask: OctopusLayer
  maskBasis?: Octopus['MaskBasis']
  maskChannels?: number[]
  layers: OctopusLayer[]
  visible?: boolean
  transform?: number[]
  opacity?: number
  blendMode?: RawBlendMode
  isTopComponent?: boolean
}

type CreateBackgroundMaskGroupOptions = {
  sourceLayer: SourceLayerFrame
  parent: OctopusLayerParent
  isTopComponent?: boolean
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
  private _name?: string
  private _mask: OctopusLayer
  private _layers: OctopusLayer[]
  private _maskBasis?: Octopus['MaskBasis']
  private _maskChannels?: number[]
  private _transform?: number[]
  private _opacity?: number
  private _blendMode?: RawBlendMode
  private _isTopComponent: boolean

  static createBackgroundLayer(frame: SourceLayerFrame, parent: OctopusLayerParent): OctopusLayer | null {
    const rawLayer = { ...(frame.raw as RawLayerShape) }
    rawLayer.id = `${rawLayer.id}-BackgroundMask`
    rawLayer.type = 'RECTANGLE' as const
    delete rawLayer.opacity
    delete rawLayer.relativeTransform
    const sourceLayer = createSourceLayer({ layer: rawLayer, parent: frame.parent })
    if (!sourceLayer) return null
    return createOctopusLayer({ layer: sourceLayer, parent })
  }

  static createBackgroundMaskGroup({
    sourceLayer,
    parent,
    isTopComponent = false,
  }: CreateBackgroundMaskGroupOptions): OctopusLayerMaskGroup | null {
    const id = `${sourceLayer.id}-Background`
    const topComponentTransform =
      isTopComponent && env.NODE_ENV === 'debug' ? getTopComponentTransform(sourceLayer) : undefined // TODO remove when ISSUE is fixed https://gitlab.avcd.cz/opendesign/open-design-engine/-/issues/21
    const transform = isTopComponent ? topComponentTransform : sourceLayer.transform ?? undefined
    const mask = OctopusLayerMaskGroup.createBackgroundLayer(sourceLayer, parent)
    if (!mask) return null
    const maskBasis = sourceLayer.clipsContent ? 'BODY_EMBED' : 'SOLID'
    const layers = createOctopusLayers(sourceLayer.layers, parent)
    const visible = sourceLayer.visible
    const blendMode = sourceLayer.blendMode
    const opacity = sourceLayer.opacity
    const name = sourceLayer.name
    return new OctopusLayerMaskGroup({
      id,
      name,
      mask,
      maskBasis,
      layers,
      transform,
      parent,
      blendMode,
      opacity,
      visible,
      isTopComponent,
    })
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
    this._name = options.name
    this._mask = options.mask
    this._maskBasis = options.maskBasis
    this._maskChannels = options.maskChannels
    this._layers = options.layers
    this._visible = options.visible ?? true
    this._transform = options.transform
    this._opacity = options.opacity
    this._blendMode = options.blendMode
    this._isTopComponent = options.isTopComponent ?? false
  }

  get id(): string {
    return convertId(this._id)
  }

  get name(): string | undefined {
    return this._name
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

  get parentComponent(): OctopusComponent {
    const parent = this._parent as OctopusLayerParent
    return parent instanceof OctopusComponent ? parent : parent.parentComponent
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

  get opacity(): number | undefined {
    return this._opacity
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertLayerBlendMode(this._blendMode, { isFrameLike: true })
  }

  get meta(): Octopus['LayerMeta'] | undefined {
    const isArtboard = this._isTopComponent
    return isArtboard ? { isArtboard } : undefined
  }

  convert(): Octopus['MaskGroupLayer'] | null {
    const mask = this.mask.convert()
    if (!mask) return null

    return {
      id: this.id,
      name: this.name,
      type: this.type,
      visible: this.visible,
      opacity: this.opacity,
      blendMode: this.blendMode,
      maskBasis: this.maskBasis,
      maskChannels: this.maskChannels,
      mask,
      transform: this.transform,
      layers: getConverted(this._layers),
      meta: this.meta,
    } as const
  }
}
