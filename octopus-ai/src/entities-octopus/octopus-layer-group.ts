import OctopusLayerCommon from "./octopus-layer-common";
import SourceLayerGroup from '../entities-source/source-layer-group'
import {OctopusLayerParent} from '../typings/octopus-entities'

type OctopusLayerGroupOptions = {
    parent: OctopusLayerParent,
    sourceLayer: SourceLayerGroup
  }
export default class OctopusLayerGroup extends OctopusLayerCommon {
    constructor(options: OctopusLayerGroupOptions){
        super(options)
    }
}