import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { convertId } from '../../utils/convert'
import { OctopusArtboard } from './octopus-artboard'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from './octopus-layer-base'

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  id: string
  mask: OctopusLayer
  layers: OctopusLayer[]
  maskBasis?: Octopus['MaskBasis']
}

export class OctopusLayerMaskGroup {
  private _parent: OctopusLayerParent
  private _id: string
  private _mask: OctopusLayer
  private _layers: OctopusLayer[]
  private _maskBasis: Octopus['MaskBasis']

  constructor(options: OctopusLayerMaskGroupOptions) {
    this._parent = options.parent
    this._id = options.id
    this._mask = options.mask
    this._layers = options.layers
    this._maskBasis = options.maskBasis ?? 'BODY'
  }

  get sourceLayer(): SourceLayer {
    return this._mask.sourceLayer
  }

  get id(): string {
    return convertId(this._id)
  }

  get parentArtboard(): OctopusArtboard {
    const parent = this._parent as OctopusLayerParent
    return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
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
      mask,
      layers: getConverted(this._layers),
    } as const
  }
}
