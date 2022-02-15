import { createOctopusLayer, OctopusLayer } from '../../factories/create-octopus-layer'
import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { SourceLayerSection } from '../source/source-layer-section'
import type { Octopus } from '../../typings/octopus'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerSection
}

export class OctopusLayerGroup extends OctopusLayerCommon {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerSection
  private _layers: OctopusLayer[]

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  private _initLayers(): OctopusLayer[] {
    return this._sourceLayer.layers.reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer,
      })
      return octopusLayer ? [octopusLayer, ...layers] : layers
    }, [])
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['GroupLayer']> {
    return {
      type: 'GROUP',
      layers: getConverted(this._layers),
    } as const
  }

  convert(): Octopus['GroupLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    return {
      ...common,
      ...this._convertTypeSpecific(),
    }
  }
}
