import OctopusLayerCommon, {LayerSpecifics} from "./octopus-layer-common";
import SourceLayerGroup from '../entities-source/source-layer-group'
import {OctopusLayerParent} from '../typings/octopus-entities'
import type { Octopus } from '../typings/octopus'
import {OctopusLayer} from '../factories/create-octopus-layer'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import {createOctopusLayer} from '../factories/create-octopus-layer'

type OctopusLayerGroupOptions = {
    parent: OctopusLayerParent,
    sourceLayer: SourceLayerGroup
  }

export default class OctopusLayerGroup extends OctopusLayerCommon {
    private _layers: OctopusLayer[]
    protected _sourceLayer: SourceLayerGroup

    constructor(options: OctopusLayerGroupOptions){
        super(options)
        this._layers=this._initLayers()
    }

    private _initLayers(): OctopusLayer[] {
      return this._sourceLayer.children.reduce((layers, sourceLayer) => {
        const octopusLayer = createOctopusLayer({
          parent: this,
          layer: sourceLayer
        })
        return octopusLayer ? [ ...layers, octopusLayer ] : layers
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
          ...this._convertTypeSpecific()
        }
      }
}