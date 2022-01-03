import OctopusXDConverter from '..'
import { createOctopusLayer, OctopusLayer } from '../factories/create-octopus-layer'
import { asNumber } from '../utils/as'
import OctopusArtboardGrid from './octopus-artboard-grid'
import SourceArtboard from './source-artboard'
import SourceDesign from './source-design'


type OctopusArtboardOptions = {
  sourceDesign: SourceDesign,
  targetArtboardId: string,
  octopusXdConverter: OctopusXDConverter
}

export default class OctopusArtboard {
  _sourceDesign: SourceDesign
  _sourceArtboard: SourceArtboard
  _octopusXdConverter: OctopusXDConverter
  _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    const artboard = options.sourceDesign.getArtboardById(options.targetArtboardId)
    if (!artboard) {
      throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
    }
    this._octopusXdConverter = options.octopusXdConverter
    this._sourceDesign = options.sourceDesign
    this._sourceArtboard = artboard
    this._layers = this._initLayers()
  }

  get sourceArtboard() {
    return this._sourceArtboard
  }

  get sourceDesign() {
    return this._sourceDesign
  }

  get converter() {
    return this._octopusXdConverter
  }

  _initLayers() {
    return this._sourceArtboard.children.reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer
      })
      return octopusLayer ? [ ...layers, octopusLayer ] : layers
    }, []) 
  }

  _getDimensions() {
    return {
      width: asNumber(this._sourceArtboard.meta['uxdesign#bounds']?.width, 0),
      height: asNumber(this._sourceArtboard.meta['uxdesign#bounds']?.height, 0)
    }
  }

  _getGuides() {
    return this._sourceArtboard.guides
  }

  _getGrid() {
    return new OctopusArtboardGrid({ octopusArtboard: this })
  }

  async _getVersion() {
    const pkg = await this._octopusXdConverter.pkg
    return {
      [pkg.name]: pkg.version
    }
  }

  /**
   * @TODOs 
   * 1) Add return type `Artboard` from specs.
   * 2) Missing `backgroundColor` implementation. Should it be in virtual child layer 
   *    or `mask`-similar prop describing virtual layer?
   * 3) Discuss `includeBackgroundColorInInstance` - should it be responsibility 
   *    of background layer?
   * 4) `disabledOverrides` - should it be general prop or sketch only?
   * 5) `exportables`?
   * 6) meta vs specific
   */
  async convert() {
    const grid = this._getGrid().convert()
    const guides = this._getGuides()

    return {
      type: 'ARTBOARD',
      version: await this._getVersion(),
      id: this._sourceArtboard.refId,
      name: this._sourceArtboard.meta.name,
      dimensions: this._getDimensions(),
      ...(grid ? { grid } : null),
      ...(guides ? { guides } : null),
      layers: this._layers.map(layer => {
        return layer.convert()
      }).filter(layer => {
        return layer
      })
    }
  }
}