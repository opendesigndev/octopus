import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { createSourceLayer } from '../../factories/create-source-layer'
import { convertColor, convertRectangle } from '../../utils/convert'
import { OctopusComponent } from './octopus-component'
import { OctopusLayerShape } from './octopus-layer-shape'
import { OctopusLayerShapeLayerAdapter } from './octopus-layer-shape-layer-adapter'
import { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import type { RawLayerLayer, RawLayerShape, RawPath } from '../../typings/raw'
import type { SourceBounds, SourceColor } from '../../typings/source'
import type { SourceLayerLayer } from '../source/source-layer-layer'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerParent } from './octopus-layer-base'

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  id: string
  mask: OctopusLayer
  layers: OctopusLayer[]
  maskBasis?: Octopus['MaskBasis']
  maskChannels?: number[]
}

type CreateBackgroundOptions = {
  parent: OctopusLayerParent
  id: string
  bounds: SourceBounds | undefined
  color?: SourceColor | null
  layers: OctopusLayer[]
  isArtboard?: boolean
  visible?: boolean
}

type CreateWrapMaskOptions<T> = {
  sourceLayer: SourceLayer
  octopusLayer: T
  parent: OctopusLayerParent
}

type CreateClippingMaskOptions = {
  mask: OctopusLayer
  layers: OctopusLayer[]
  parent: OctopusLayerParent
}

export class OctopusLayerMaskGroup {
  private _parent: OctopusLayerParent
  private _id: string
  private _mask: OctopusLayer
  private _layers: OctopusLayer[]
  private _maskBasis: Octopus['MaskBasis']
  private _maskChannels: number[] | undefined

  static createBackground({
    id,
    bounds,
    color,
    layers,
    isArtboard,
    visible,
  }: CreateBackgroundOptions): Octopus['MaskGroupLayer'] {
    const rectangle = convertRectangle(bounds)
    const fills: Octopus['Fill'][] = color ? [{ type: 'COLOR', color: convertColor(color) }] : []
    const mask: Octopus['ShapeLayer'] = {
      id: `${id}-BackgroundMask`,
      type: 'SHAPE',
      visible: fills.length > 0,
      shape: { path: { type: 'RECTANGLE', rectangle }, fills },
    }
    const meta = isArtboard ? { isArtboard } : undefined
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

  static wrapWithBitmapMaskIfNeeded<T extends OctopusLayer>({
    sourceLayer,
    octopusLayer,
    parent,
  }: CreateWrapMaskOptions<T>): OctopusLayerMaskGroup | T {
    const bitmapMask = sourceLayer.bitmapMask
    if (!bitmapMask) return octopusLayer

    const { width, height } = octopusLayer.parentComponent.dimensions
    const bounds = { left: 0, right: width, top: 0, bottom: height }
    const raw: RawLayerLayer = { type: 'layer', bitmapBounds: bounds, bounds, visible: false, imageName: bitmapMask }
    const maskSourceLayer = createSourceLayer({ layer: raw, parent: sourceLayer?.parent }) as SourceLayerLayer
    const maskAdapter = new OctopusLayerShapeLayerAdapter({ parent, sourceLayer: maskSourceLayer })
    const mask = new OctopusLayerShape({ parent, sourceLayer, adapter: maskAdapter })
    return new OctopusLayerMaskGroup({
      parent,
      id: `${octopusLayer.id}-BitmapMask`,
      mask,
      layers: [octopusLayer],
      maskBasis: 'FILL',
      maskChannels: [1, 0, 0, 0, 0],
    })
  }

  static wrapWithShapeMaskIfNeeded<T extends OctopusLayer>({
    sourceLayer,
    octopusLayer,
    parent,
  }: CreateWrapMaskOptions<T>): OctopusLayerMaskGroup | T {
    const path = sourceLayer.path
    if (!path) return octopusLayer

    const raw: RawLayerShape = { type: 'shapeLayer', visible: false, path: path.raw as RawPath }
    const maskSourceLayer = createSourceLayer({ layer: raw, parent: sourceLayer?.parent }) as SourceLayerShape
    const maskAdapter = new OctopusLayerShapeShapeAdapter({ parent, sourceLayer: maskSourceLayer })
    const mask = new OctopusLayerShape({ parent, sourceLayer, adapter: maskAdapter })
    const id = `${octopusLayer.id}-ShapeMask`
    return new OctopusLayerMaskGroup({ id, parent, mask, maskBasis: 'BODY', layers: [octopusLayer] })
  }

  static createClippingMask({ mask, layers, parent }: CreateClippingMaskOptions): OctopusLayerMaskGroup {
    const id = `${mask.id}-ClippingMask`
    const maskBasis = mask.sourceLayer.type === 'layer' ? 'FILL_EMBED' : 'BODY_EMBED'
    return new OctopusLayerMaskGroup({ id, parent, mask, layers, maskBasis })
  }

  constructor(options: OctopusLayerMaskGroupOptions) {
    this._parent = options.parent
    this._id = options.id
    this._mask = options.mask
    this._layers = options.layers
    this._maskBasis = options.maskBasis ?? 'BODY'
    this._maskChannels = options.maskChannels
  }

  get sourceLayer(): SourceLayer {
    return this._mask.sourceLayer
  }

  get id(): string {
    return this._id
  }

  get parentComponent(): OctopusComponent {
    const parent = this._parent as OctopusLayerParent
    return parent instanceof OctopusComponent ? parent : parent.parentComponent
  }

  get type(): 'MASK_GROUP' {
    return 'MASK_GROUP'
  }

  convert(): Octopus['MaskGroupLayer'] | null {
    const mask = this._mask.convert()
    if (!mask) return null

    return {
      id: this._id,
      type: this.type,
      maskBasis: this._maskBasis,
      maskChannels: this._maskChannels,
      mask,
      layers: getConverted(this._layers),
    } as const
  }
}
