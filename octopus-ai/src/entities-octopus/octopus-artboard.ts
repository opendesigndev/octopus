import OctopusAIConverter from '..'
import SourceDesign from '../entities-source/source-design'
import SourceArtboard from '../entities-source/source-artboard'
import { OctopusLayer} from '../factories/create-octopus-layer'
import {asArray} from '../utils/as'

type OctopusArtboardOptions = {
    sourceDesign: SourceDesign,
    targetArtboardId: string,
    octopusAIConverter: OctopusAIConverter
  }

export default class OctopusArtboard {
    private _sourceDesign: SourceDesign
    private _sourceArtboard: SourceArtboard
    private _octopusAIConverter: OctopusAIConverter
    private _layers: OctopusLayer[]

    constructor(options: OctopusArtboardOptions) {
        const artboard = options.sourceDesign.getArtboardById(options.targetArtboardId)
        if (!artboard) {
          throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
        }
        this._octopusAIConverter = options.octopusAIConverter
        this._sourceDesign = options.sourceDesign
        this._sourceArtboard = artboard
        this._layers = this._initLayers()
      }

      private _initLayers() {
        // return this._sourceArtboard.children.reduce((layers, sourceLayer) => {
        //   const octopusLayer = createOctopusLayer({
        //     parent: this,
        //     layer: sourceLayer
        //   })
        //   return octopusLayer ? [ ...layers, octopusLayer ] : layers
        // }, []) 

        return []
      }

      get dimensions () {
       return this._sourceArtboard.dimensions
      }

      get hiddenContentIds() {
        return asArray(this._sourceArtboard.hiddenContentObjectIds,[])
        .map(c=>c.ObjID)
        .filter(id=>id) as number[]
      }

      get resources () {
        return this._sourceArtboard.resources
      }
}