import { OctopusLayer, createOctopusLayers } from '../../factories/create-octopus-layer'
import { LayerSpecifics, OctopusLayerBase, OctopusLayerParent } from './octopus-layer-base'
import type { SourceLayerSection } from '../source/source-layer-section'
import type { Octopus } from '../../typings/octopus'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerSection
}

type CreateBackgroundOptions = {
  id: string
  layers: Octopus['Layer'][]
}

export class OctopusLayerGroup extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerSection
  private _layers: OctopusLayer[]

  static createBackground({ id, layers }: CreateBackgroundOptions): Octopus['GroupLayer'] {
    return { id: `${id}:background`, type: 'GROUP', layers }
  }

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = createOctopusLayers(this._sourceLayer.layers, this)
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['GroupLayer']> {
    return {
      type: 'GROUP',
      layers: getConverted(this._layers),
    } as const
  }

  convert(): Octopus['GroupLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    return { ...common, ...this._convertTypeSpecific() }
  }
}
