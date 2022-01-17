import { createOctopusLayer, OctopusLayer } from '../../factories/create-octopus-layer'
import { OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import { SourceLayerSection } from '../source/source-layer-section'
import type { Octopus } from '../../typings/octopus'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerSection
}

export class OctopusLayerGroup extends OctopusLayerCommon {
  _parent: OctopusLayerParent
  _sourceLayer: SourceLayerSection
  _layers: OctopusLayer[]

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  _initLayers(): OctopusLayer[] {
    return this._sourceLayer.layers.reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer,
      })
      return octopusLayer ? [...layers, octopusLayer] : layers
    }, [])
  }

  /**
   * @TODOs
   * Guard with correct return type
   * @returns
   */
  convertTypeSpecific() {
    const layers = this._layers.map((layer) => layer.convert()).filter(Boolean) as Octopus['Layer'][]
    return { layers }
  }

  convert(): Octopus['GroupLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    return {
      ...common,
      ...this.convertTypeSpecific(),
    }
  }
}
