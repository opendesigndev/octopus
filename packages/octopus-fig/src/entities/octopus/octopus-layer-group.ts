import { getConverted } from '@opendesign/octopus-common/dist/utils/common'

import { createOctopusLayers } from '../../factories/create-octopus-layer'
import { env } from '../../services'
import { DEFAULTS } from '../../utils/defaults'
import { isEmptyObj } from '../../utils/misc'
import { getTopComponentTransform } from '../../utils/source'
import { OctopusLayerBase } from './octopus-layer-base'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type { SourceLayerContainer } from '../source/source-layer-container'
import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerContainer
}

export class OctopusLayerGroup extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerContainer
  private _layers: OctopusLayer[]

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = createOctopusLayers(this._sourceLayer.layers, this)
  }

  get type(): Octopus['GroupLayer']['type'] | null {
    return 'GROUP'
  }

  get transform(): number[] {
    if (this.isTopLayer)
      return env.NODE_ENV === 'debug' // TODO remove when ISSUE is fixed https://gitlab.avcd.cz/opendesign/open-design-engine/-/issues/21
        ? getTopComponentTransform(this._sourceLayer) ?? DEFAULTS.TRANSFORM
        : DEFAULTS.TRANSFORM
    return this.sourceLayer.transform ?? DEFAULTS.TRANSFORM
  }

  get meta(): Octopus['LayerMeta'] | undefined {
    const isArtboard = ['FRAME', 'COMPONENT', 'INSTANCE'].includes(this.sourceLayer.type) ? true : undefined
    const meta = { isArtboard }
    return !isEmptyObj(meta) ? meta : undefined
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
