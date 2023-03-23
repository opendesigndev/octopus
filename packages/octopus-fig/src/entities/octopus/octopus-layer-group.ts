import { getConvertedAsync } from '@opendesign/octopus-common/dist/utils/common.js'

import { OctopusLayerBase } from './octopus-layer-base.js'
import { createOctopusLayers } from '../../factories/create-octopus-layer.js'
import { env } from '../../services/index.js'
import { DEFAULTS } from '../../utils/defaults.js'
import { isEmptyObj } from '../../utils/misc.js'
import { getTopComponentTransform } from '../../utils/source.js'

import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base.js'
import type { OctopusLayer } from '../../factories/create-octopus-layer.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceLayerContainer } from '../source/source-layer-container.js'

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

  private async _convertTypeSpecific(): Promise<LayerSpecifics<Octopus['GroupLayer']>> {
    return {
      type: 'GROUP',
      layers: await getConvertedAsync(this.layers),
      meta: this.meta,
    } as const
  }

  async convert(): Promise<Octopus['GroupLayer'] | null> {
    const common = this.convertBase()
    if (!common) return null

    const specific = await this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
