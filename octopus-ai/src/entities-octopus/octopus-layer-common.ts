
import SourceResources from '../entities-source/source-resources'
import {SourceLayer} from '../factories/create-source-layer'
import type { Octopus } from '../typings/octopus'
import { RawResources } from '../typings/source'
import OctopusArtboard from './octopus-artboard'
import OctopusLayerGroup from './octopus-layer-group'

export type OctopusLayerParent = OctopusArtboard | OctopusLayerGroup

/** @TODO fix exclusion of `type` from return type after schema update */
export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type'>>

type OctopusLayerCommonOptions = {
    parent: OctopusLayerParent,
    sourceLayer: SourceLayer
  }

export default class OctopusLayerCommon {
    protected _id: string
    protected _parent: OctopusLayerParent
    protected _sourceLayer: SourceLayer

    constructor(options: OctopusLayerCommonOptions){
        this._parent = options.parent
        this._sourceLayer = options.sourceLayer

        this._id = options.sourceLayer.path.join(':')
    }

    get parent() {
        return this._parent
      }

      get id() {
        return this._id
      }

      get dimensions (): Octopus['Dimensions'] {
        return this._parent.dimensions
      }

      get hiddenContentIds() {
        const hiddenContentIds:number[] = this._parent.hiddenContentIds || []
        return hiddenContentIds
      }

      get resources (): SourceResources|undefined {
        return this._parent.resources
      }
      
    convertCommon() {
      return {
        id: this.id,
        name: this._sourceLayer.name
      }
    }
}