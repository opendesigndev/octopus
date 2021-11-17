import { createOctopusLayer, OctopusLayer } from '../factories/octopus-layer'
import OctopusArtboard from './octopus-artboard'
import SourceLayerGroup from './source-layer-group'


type OctopusLayerGroupOptions = {
  parent: OctopusLayerGroup | OctopusArtboard,
  sourceLayerGroup: SourceLayerGroup
}

export default class OctopusLayerGroup {
  _parent: OctopusLayerGroup | OctopusArtboard
  _sourceLayerGroup: SourceLayerGroup
  _layers: OctopusLayer[]

  constructor(options: OctopusLayerGroupOptions) {
    this._parent = options.parent
    this._sourceLayerGroup = options.sourceLayerGroup
    this._layers = this._initLayers()
  }

  _initLayers() {
    return this._sourceLayerGroup.children.reduce((layers, sourceLayer) => {
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
  convert(): any {
    return {
      type: 'group-octopus',
      layers: this._layers.map(layer => {
        return layer.convert()
      })
    }
  }
}