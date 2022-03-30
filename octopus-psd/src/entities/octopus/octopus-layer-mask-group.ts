import { OctopusLayer } from '../../factories/create-octopus-layer'
import { OctopusLayerParent } from './octopus-layer-base'
import type { Octopus } from '../../typings/octopus'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import { OctopusArtboard } from './octopus-artboard'
import type { SourceBounds, SourceColor } from '../../typings/source'
import { convertColor, convertRectangle } from '../../utils/convert'

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  id: string
  mask: OctopusLayer
  layers: OctopusLayer[]
  maskBasis?: Octopus['MaskBasis']
}

type CreateBackgroundOptions = {
  id: string
  bounds: SourceBounds | undefined
  color?: SourceColor | null
  layers: Octopus['Layer'][]
  isArtboard?: boolean
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
    return { id: `${id}:background`, type: 'MASK_GROUP', maskBasis: 'BODY', mask, layers, meta: { isArtboard } }
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
