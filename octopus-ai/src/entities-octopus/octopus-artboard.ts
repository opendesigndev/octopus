import OctopusAIConverter from '..'
import SourceDesign from '../entities-source/source-design'
import SourceArtboard from '../entities-source/source-artboard'
import { OctopusLayer} from '../factories/create-octopus-layer'

type OctopusArtboardOptions = {
    sourceDesign: SourceDesign,
    targetArtboardId: string,
    octopusAIConverter: OctopusAIConverter
  }

export default class OctopusArtboard {
    private _sourceDesign: SourceDesign
    private _sourceArtboard: SourceArtboard
    private _octopusXdConverter: OctopusAIConverter
    private _layers: OctopusLayer[]

    constructor(options: OctopusArtboardOptions) {
        const artboard = options.sourceDesign.getArtboardById(options.targetArtboardId)
        if (!artboard) {
          throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
        }
        this._octopusXdConverter = options.octopusAIConverter
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
}