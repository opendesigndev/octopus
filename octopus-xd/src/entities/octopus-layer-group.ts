import { createOctopusLayer, OctopusLayer } from '../factories/create-octopus-layer'
import OctopusLayerCommon, { OctopusLayerParent } from './octopus-layer-common'
import SourceLayerGroup from './source-layer-group'
import type { Octopus } from '../typings/octopus'


type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent,
  sourceLayer: SourceLayerGroup
}

export default class OctopusLayerGroup extends OctopusLayerCommon {
  _parent: OctopusLayerParent
  _sourceLayer: SourceLayerGroup
  _layers: OctopusLayer[]

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  _initLayers(): OctopusLayer[] {
    return this._sourceLayer.children.reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer
      })
      return octopusLayer ? [ ...layers, octopusLayer ] : layers
    }, []) 
  }

  /**
   * @TODOs
   * Guard with correct return type
   * @returns 
   */
  convertTypeSpecific() {
    return {
      layers: this._layers.map(layer => layer.convert()).filter(Boolean) as Octopus['Layer'][]
    }
  }

  convert(): Octopus['GroupLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    return {
      ...common,
      ...this.convertTypeSpecific()
    }
  }
}
