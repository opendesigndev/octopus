import OctopusArtboard from './octopus-artboard'
import OctopusLayerCommon from './octopus-layer-common'
import OctopusLayerGroup from './octopus-layer-group'
import SourceLayerShape from './source-layer-shape'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerGroup | OctopusArtboard,
  sourceLayer: SourceLayerShape
}

export default class OctopusLayerShape extends OctopusLayerCommon {
  _parent: OctopusLayerGroup | OctopusArtboard
  _sourceLayer: SourceLayerShape

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
  }

  /**
   * @TODOs
   * Guard with correct return type
   * @returns 
   */
  convertTypeSpecific(): any {
    return {}
  }
}