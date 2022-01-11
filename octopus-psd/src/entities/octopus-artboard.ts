import { OctopusPSDConverter } from '..'
// import { createOctopusLayer, OctopusLayer } from '../factories/create-octopus-layer'
import { asNumber } from '../utils/as'
// import OctopusArtboardGrid from './octopus-artboard-grid'
import { SourceArtboard } from './source-artboard'

type OctopusArtboardOptions = {
  sourceArtboard: SourceArtboard
  octopusConverter: OctopusPSDConverter
}

export class OctopusArtboard {
  _sourceArtboard: SourceArtboard
  _octopusConverter: OctopusPSDConverter
  // _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    this._octopusConverter = options.octopusConverter
    this._sourceArtboard = options.sourceArtboard
    // this._layers = this._initLayers()
  }

  get sourceArtboard() {
    return this._sourceArtboard
  }

  get converter() {
    return this._octopusConverter
  }

  // _initLayers() {
  //   return this._sourceArtboard.children.reduce((layers, sourceLayer) => {
  //     const octopusLayer = createOctopusLayer({
  //       parent: this,
  //       layer: sourceLayer
  //     })
  //     return octopusLayer ? [ ...layers, octopusLayer ] : layers
  //   }, [])
  // }

  _getDimensions() {
    return {
      width: asNumber(this._sourceArtboard.bounds.right - this._sourceArtboard.bounds.left, 0),
      height: asNumber(this._sourceArtboard.bounds.bottom - this._sourceArtboard.bounds.top, 0),
    }
  }

  _getGuides() {
    return this._sourceArtboard.guides
  }

  _getId() {
    return this._octopusConverter._id
  }

  // _getGrid() {
  //   return new OctopusArtboardGrid({ octopusArtboard: this })
  // }

  async _getVersion() {
    const pkg = await this._octopusConverter.pkg
    return {
      [pkg.name]: pkg.version,
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
    // const grid = this._getGrid().convert()
    const guides = this._getGuides()

    return {
      id: this._getId(),
      type: 'ARTBOARD',
      version: await this._getVersion(),
      dimensions: this._getDimensions(),
      // ...(grid ? { grid } : null),
      ...(guides ? { guides } : null),
      // layers: this._layers
      //   .map((layer) => {
      //     return layer.convert()
      //   })
      //   .filter((layer) => {
      //     return layer
      //   }),
    }
  }
}
