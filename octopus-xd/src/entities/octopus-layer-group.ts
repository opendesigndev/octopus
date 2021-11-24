import { createOctopusLayer, OctopusLayer } from '../factories/octopus-layer'
import OctopusArtboard from './octopus-artboard'
import OctopusLayerCommon from './octopus-layer-common'
import SourceLayerGroup from './source-layer-group'


type OctopusLayerGroupOptions = {
  parent: OctopusLayerGroup | OctopusArtboard,
  sourceLayer: SourceLayerGroup
}

export default class OctopusLayerGroup extends OctopusLayerCommon {
  _parent: OctopusLayerGroup | OctopusArtboard
  _sourceLayer: SourceLayerGroup
  _layers: OctopusLayer[]

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  _initLayers() {
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
  convertTypeSpecific(): any {
    return {
      layers: this._layers.map(layer => {
        return layer.convert()
      }).filter(layer => {
        return layer
      })
    }
  }
}