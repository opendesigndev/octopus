import { OctopusLayer } from '../../factories/create-octopus-layer'
import { OctopusLayerParent } from './octopus-layer-base'
import type { Octopus } from '../../typings/octopus'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import { OctopusArtboard } from './octopus-artboard'

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  id: string
  mask: OctopusLayer
  layers: OctopusLayer[]
  maskBasis?: Octopus['MaskBasis']
}

type createBackgroundOptions = {
  id: string
  width: number
  height: number
  layers: Octopus['Layer'][]
}

export class OctopusLayerMaskGroup {
  private _parent: OctopusLayerParent
  private _id: string
  private _mask: OctopusLayer
  private _layers: OctopusLayer[]
  private _maskBasis: Octopus['MaskBasis']

  static virtualBackground({ id, width, height, layers }: createBackgroundOptions): Octopus['MaskGroupLayer'] {
    return {
      id: `${id}:background`,
      type: 'MASK_GROUP',
      maskBasis: 'BODY',
      mask: {
        id: `${id}:backgroundMask`,
        type: 'SHAPE',
        visible: false,
        shape: { path: { type: 'RECTANGLE', rectangle: { x0: 0, y0: 0, x1: width, y1: height } } },
      },
      layers,
    }
  }

  constructor(options: OctopusLayerMaskGroupOptions) {
    this._parent = options.parent
    this._id = options.id
    this._mask = options.mask
    this._layers = options.layers
    this._maskBasis = options.maskBasis ?? 'BODY'
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
