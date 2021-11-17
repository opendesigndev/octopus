import OctopusArtboard from './octopus-artboard'
import OctopusLayerGroup from './octopus-layer-group'
import SourceLayerShape from './source-layer-shape'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerGroup | OctopusArtboard,
  sourceLayerShape: SourceLayerShape
}

export default class OctopusLayerShape {
  _parent: OctopusLayerGroup | OctopusArtboard
  _sourceLayerShape: SourceLayerShape

  constructor(options: OctopusLayerShapeOptions) {
    this._parent = options.parent
    this._sourceLayerShape = options.sourceLayerShape
  }

  /**
   * @TODOs
   * Guard with correct return type
   * @returns 
   */
  convert(): any {
    return {
      type: 'shape-octopus'
    }
  }
}