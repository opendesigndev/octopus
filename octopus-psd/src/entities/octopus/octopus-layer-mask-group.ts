import { OctopusLayer } from '../../factories/create-octopus-layer'
import { OctopusLayerParent } from './octopus-layer-base'
import type { Octopus } from '../../typings/octopus'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import { OctopusArtboard } from './octopus-artboard'
import type { SourceBounds, SourceColor } from '../../typings/source'
import { convertColor, convertRectangle } from '../../utils/convert'
import type { RawLayerLayer, RawLayerShape, RawPath } from '../../typings/raw'
import type { SourceLayerShape } from '../source/source-layer-shape'
import { createSourceLayer, SourceLayer } from '../../factories/create-source-layer'
import { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import { OctopusLayerShape } from './octopus-layer-shape'
import type { SourcePath } from '../source/source-path'
import type { SourceLayerLayer } from '../source/source-layer-layer'
import { OctopusLayerShapeLayerAdapter } from './octopus-layer-shape-layer-adapter'

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  id: string
  mask: OctopusLayer
  layers: OctopusLayer[]
  maskBasis?: Octopus['MaskBasis']
}

type CreateBackgroundOptions = {
  parent: OctopusLayerParent
  id: string
  bounds: SourceBounds | undefined
  color?: SourceColor | null
  layers: OctopusLayer[]
  isArtboard?: boolean
}

type CreateBitmapMaskOptions<T> = {
  sourceLayer: SourceLayer
  octopusLayer: T
  parent: OctopusLayerParent
  bitmapMask: string
}

type CreateShapeMaskOptions<T> = {
  sourceLayer: SourceLayer
  octopusLayer: T
  parent: OctopusLayerParent
  path: SourcePath
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

  static createBackground({
    id,
    bounds,
    color,
    layers,
    isArtboard,
  }: CreateBackgroundOptions): Octopus['MaskGroupLayer'] {
    const rectangle = convertRectangle(bounds)
    const fills: Octopus['Fill'][] = color ? [{ type: 'COLOR', color: convertColor(color) }] : []
    const mask: Octopus['ShapeLayer'] = {
      id: `${id}:backgroundMask`,
      type: 'SHAPE',
      visible: fills.length > 0,
      shape: { path: { type: 'RECTANGLE', rectangle }, fills },
    }
    return {
      id: `${id}:background`,
      type: 'MASK_GROUP',
      maskBasis: 'BODY',
      mask,
      layers: getConverted(layers),
      meta: { isArtboard },
    }
  }

  static createBitmapMask<T extends OctopusLayer>({
    bitmapMask,
    sourceLayer,
    octopusLayer,
    parent,
  }: CreateBitmapMaskOptions<T>): OctopusLayerMaskGroup {
    const { width, height } = octopusLayer.parentArtboard.dimensions
    const bounds = { left: 0, right: width, top: 0, bottom: height }
    const raw: RawLayerLayer = { type: 'layer', bitmapBounds: bounds, bounds, visible: false, imageName: bitmapMask }
    const maskSourceLayer = createSourceLayer({ layer: raw, parent: sourceLayer?.parent }) as SourceLayerLayer
    const maskAdapter = new OctopusLayerShapeLayerAdapter({ parent, sourceLayer: maskSourceLayer })
    maskAdapter.setFillBlendMode('BRIGHTNESS_TO_ALPHA')
    const mask = new OctopusLayerShape({ parent, sourceLayer, adapter: maskAdapter })
    return new OctopusLayerMaskGroup({
      parent,
      id: `${octopusLayer.id}:BitmapMask`,
      mask,
      layers: [octopusLayer],
      maskBasis: 'LAYER',
    })
  }

  static createShapeMask<T extends OctopusLayer>({
    path,
    sourceLayer,
    octopusLayer,
    parent,
  }: CreateShapeMaskOptions<T>): OctopusLayerMaskGroup {
    const raw: RawLayerShape = { type: 'shapeLayer', visible: false, path: path.raw as RawPath }
    const maskSourceLayer = createSourceLayer({ layer: raw, parent: sourceLayer?.parent }) as SourceLayerShape
    const maskAdapter = new OctopusLayerShapeShapeAdapter({ parent, sourceLayer: maskSourceLayer })
    const mask = new OctopusLayerShape({ parent, sourceLayer, adapter: maskAdapter })
    const id = `${octopusLayer.id}:ShapeMask`
    return new OctopusLayerMaskGroup({ id, parent, mask, maskBasis: 'BODY', layers: [octopusLayer] })
  }

  static createClippingMask({ mask, layers, parent }: CreateClippingMaskOptions): OctopusLayerMaskGroup {
    const id = `${mask.id}:ClippingMask`
    const maskBasis = 'BODY'
    return new OctopusLayerMaskGroup({ id, parent, mask, layers, maskBasis })
  }

  constructor(options: OctopusLayerMaskGroupOptions) {
    this._parent = options.parent
    this._id = options.id
    this._mask = options.mask
    this._layers = options.layers
    this._maskBasis = options.maskBasis ?? 'BODY'
  }

  get sourceLayer(): null {
    return null
  }

  get id(): string {
    return this._id
  }

  get parentArtboard(): OctopusArtboard {
    const parent = this._parent as OctopusLayerParent
    return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
  }

  convert(): Octopus['MaskGroupLayer'] | null {
    const mask = this._mask.convert()
    if (!mask) return null

    return {
      id: this._id,
      type: 'MASK_GROUP',
      maskBasis: this._maskBasis,
      mask,
      layers: getConverted(this._layers),
    } as const
  }
}
