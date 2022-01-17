import type { OctopusPSDConverter } from '../..'
import type { Octopus } from '../../typings/octopus'
import { createOctopusLayer, OctopusLayer } from '../../factories/create-octopus-layer'
import { asNumber } from '../../utils/as'
import type { SourceArtboard } from '../source/source-artboard'

type OctopusArtboardOptions = {
  sourceArtboard: SourceArtboard
  octopusConverter: OctopusPSDConverter
}

export class OctopusArtboard {
  private _sourceArtboard: SourceArtboard
  private _octopusConverter: OctopusPSDConverter
  private _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    this._octopusConverter = options.octopusConverter
    this._sourceArtboard = options.sourceArtboard
    this._layers = this._initLayers()
  }

  get sourceArtboard() {
    return this._sourceArtboard
  }

  get converter() {
    return this._octopusConverter
  }

  _initLayers() {
    return this._sourceArtboard.layers.reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer,
      })
      return octopusLayer ? [...layers, octopusLayer] : layers
    }, [])
  }

  _getDimensions() {
    const { right, left, bottom, top } = this._sourceArtboard.bounds
    return {
      width: asNumber(right - left, 0),
      height: asNumber(bottom - top, 0),
    }
  }

  _getId() {
    return this._octopusConverter._id
  }

  async _getVersion() {
    const pkg = await this._octopusConverter.pkg
    return pkg.version
  }

  async convert() {
    return {
      id: this._getId(),
      type: 'ARTBOARD',
      version: await this._getVersion(),
      dimensions: this._getDimensions(),
      layers: this._layers.map((layer) => layer.convert()).filter((layer) => layer),
    } as Octopus['OctopusDocument']
  }
}
