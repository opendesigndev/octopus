import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { createOctopusLayers } from '../../factories/create-octopus-layer'
import { env } from '../../services'
import { DEFAULTS } from '../../utils/defaults'
import { getTopComponentTransform } from '../../utils/source'
import { OctopusLayerBase } from './octopus-layer-base'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type { SourceLayerFrame } from '../source/source-layer-frame'
import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerFrame
  isTopComponent?: boolean
}

export class OctopusLayerGroup extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerFrame
  private _layers: OctopusLayer[]
  private _isTopComponent: boolean

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._isTopComponent = options.isTopComponent ?? false
    this._layers = createOctopusLayers(this._sourceLayer.layers, this)
  }

  get type(): Octopus['GroupLayer']['type'] | null {
    return 'GROUP'
  }

  get transform(): number[] {
    if (this._isTopComponent)
      return env.NODE_ENV === 'debug' // TODO remove when ISSUE is fixed https://gitlab.avcd.cz/opendesign/open-design-engine/-/issues/21
        ? getTopComponentTransform(this._sourceLayer) ?? DEFAULTS.TRANSFORM
        : DEFAULTS.TRANSFORM
    return this.sourceLayer.transform ?? DEFAULTS.TRANSFORM
  }

  get meta(): Octopus['LayerMeta'] | undefined {
    const isArtboard = this._isTopComponent
    return isArtboard ? { isArtboard } : undefined
  }

  get layers(): OctopusLayer[] {
    return this._layers
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['GroupLayer']> {
    return {
      type: 'GROUP',
      layers: getConverted(this._layers),
      meta: this.meta,
    } as const
  }

  convert(): Octopus['GroupLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
