
import {SourceLayer} from '../factories/create-source-layer'

export type OctopusLayerParent = any
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
}