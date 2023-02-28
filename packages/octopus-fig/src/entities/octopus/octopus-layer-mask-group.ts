import { getConvertedAsync } from '@opendesign/octopus-common/dist/utils/common.js'

import { createOctopusLayer, createOctopusLayers } from '../../factories/create-octopus-layer.js'
import { createSourceLayer } from '../../factories/create-source-layer.js'
import { env } from '../../services/index.js'
import { convertId, convertLayerBlendMode } from '../../utils/convert.js'
import { DEFAULTS } from '../../utils/defaults.js'
import { getTopComponentTransform } from '../../utils/source.js'
import { OctopusComponent } from './octopus-component.js'

import type { OctopusLayer } from '../../factories/create-octopus-layer.js'
import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { Octopus } from '../../typings/octopus.js'
import type { RawBlendMode, RawLayerShape } from '../../typings/raw/index.js'
import type { SourceBounds } from '../../typings/source.js'
import type { SourceLayerContainer } from '../source/source-layer-container.js'
import type { OctopusLayerParent } from './octopus-layer-base.js'

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  id: string
  name?: string
  mask: OctopusLayer
  maskBasis?: Octopus['MaskBasis']
  maskChannels?: number[]
  visible?: boolean
  transform?: number[]
  opacity?: number
  blendMode?: RawBlendMode
  isArtboard?: boolean
  boundingBox?: SourceBounds
}

type CreateBackgroundMaskGroupOptions = {
  sourceLayer: SourceLayerContainer
  parent: OctopusLayerParent
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
  private _boundingBox?: SourceBounds
  private _isArtboard: boolean

  static createBackgroundLayer(frame: SourceLayerContainer, parent: OctopusLayerParent): OctopusLayer | null {
    const rawLayer = { ...(frame.raw as RawLayerShape) }
    rawLayer.id = `${rawLayer.id}-BackgroundMask`
    rawLayer.type = 'RECTANGLE' as const
    delete rawLayer.opacity
    delete rawLayer.relativeTransform
    delete rawLayer.rectangleCornerRadii // Gitlab Issue #17
    const sourceLayer = createSourceLayer({ layer: rawLayer, parent: frame.parent })
    if (!sourceLayer) return null
    return createOctopusLayer({ layer: sourceLayer, parent })
  }

  static createBackgroundMaskGroup({
    sourceLayer,
    parent,
  }: CreateBackgroundMaskGroupOptions): OctopusLayerMaskGroup | null {
    const id = `${sourceLayer.id}-Background`
    const isTopLayer = parent instanceof OctopusComponent
    const topComponentTransform =
      isTopLayer && env.NODE_ENV === 'debug' ? getTopComponentTransform(sourceLayer) : undefined // TODO remove when ISSUE is fixed https://gitlab.avcd.cz/opendesign/open-design-engine/-/issues/21
    const transform = isTopLayer ? topComponentTransform : sourceLayer.transform ?? undefined
    const mask = OctopusLayerMaskGroup.createBackgroundLayer(sourceLayer, parent)
    if (!mask) return null
    const maskBasis = sourceLayer.clipsContent ? 'BODY_EMBED' : 'SOLID'
    const { visible, blendMode, opacity, name, isArtboard } = sourceLayer
    const boundingBox = sourceLayer.boundingBox ?? undefined

    const maskLayer = new OctopusLayerMaskGroup({
      id,
      name,
      mask,
      maskBasis,
      transform,
      parent,
      blendMode,
      opacity,
      visible,
      isArtboard,
      boundingBox,
    })
    maskLayer.layers = createOctopusLayers(sourceLayer.layers, maskLayer)
    return maskLayer
  }

  static createClippingMask({ mask, layers, parent }: CreateMaskGroupOptions): OctopusLayerMaskGroup | null {
    const id = `${mask.id}-ClippingMask`
    const maskBasis = 'LAYER_AND_EFFECTS'
    mask.visible = false
    const maskLayer = new OctopusLayerMaskGroup({ id, parent, mask, maskBasis })
    maskLayer.layers = layers
    return maskLayer
  }

  static createClippingMaskOutline({ mask, layers, parent }: CreateMaskGroupOptions): OctopusLayerMaskGroup | null {
    const id = `${mask.id}-ClippingMask`
    const maskBasis = 'BODY'
    mask.visible = false
    const maskLayer = new OctopusLayerMaskGroup({ id, parent, mask, maskBasis })
    maskLayer.layers = layers
    return maskLayer
  }

  constructor(options: OctopusLayerMaskGroupOptions) {
    const {
      parent,
      id,
      name,
      mask,
      maskBasis,
      maskChannels,
      visible,
      transform,
      opacity,
      blendMode,
      isArtboard,
      boundingBox,
    } = options
    this._id = id
    this._name = name
    this._mask = mask
    this._maskBasis = maskBasis
    this._maskChannels = maskChannels
    this._parent = parent
    this._visible = visible ?? true
    this._transform = transform
    this._opacity = opacity
    this._blendMode = blendMode
    this._boundingBox = boundingBox
    this._isArtboard = isArtboard ?? false
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

  get isTopLayer(): boolean {
    return this._parent instanceof OctopusComponent
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

  set layers(layers: OctopusLayer[]) {
    this._layers = layers
  }

  get opacity(): number | undefined {
    return this._opacity
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertLayerBlendMode(this._blendMode, { isFrameLike: true })
  }

  get meta(): Octopus['LayerMeta'] | undefined {
    return { isArtboard: true }
  }

  get sourceLayer(): SourceLayer {
    return this._parent.sourceLayer
  }

  async convert(): Promise<Octopus['MaskGroupLayer'] | null> {
    const convertedMask = await this.mask.convert()
    if (!convertedMask) return null

    return {
      id: this.id,
      name: this.name,
      type: this.type,
      visible: this.visible,
      opacity: this.opacity,
      blendMode: this.blendMode,
      maskBasis: this.maskBasis,
      maskChannels: this.maskChannels,
      mask: convertedMask,
      transform: this.transform,
      layers: await getConvertedAsync(this.layers),
      meta: this.meta,
    } as const
  }
}
