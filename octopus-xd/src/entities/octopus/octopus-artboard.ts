import { createOctopusLayer } from '../../factories/create-octopus-layer'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import type { Octopus } from '../../typings/octopus'
import type SourceArtboard from '../source/source-artboard'
import type SourceDesign from '../source/source-design'
import type OctopusXDConverter from '../..'
import type { OctopusLayer } from '../../factories/create-octopus-layer'
import OctopusArtboardDimensions from './octopus-artboard-dimensions'


type OctopusArtboardOptions = {
  sourceDesign: SourceDesign,
  targetArtboardId: string,
  octopusXdConverter: OctopusXDConverter
}

export default class OctopusArtboard {
  private _sourceDesign: SourceDesign
  private _sourceArtboard: SourceArtboard
  private _octopusXdConverter: OctopusXDConverter
  private _layers: OctopusLayer[]

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

  private _initLayers() {
    return this._sourceArtboard.children.reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer
      })
      return octopusLayer ? [...layers, octopusLayer] : layers
    }, [])
  }

  private _getDimensions() {
    return new OctopusArtboardDimensions({
      sourceArtboard: this._sourceArtboard
    })
  }

  private async _getVersion() {
    const pkg = await this._octopusXdConverter.pkg
    return pkg.version
  }

  /** @TODOs Add background layer */
  async convert(): Promise<Octopus['OctopusDocument']> {
    if (typeof this._sourceArtboard.refId !== 'string') {
      throw new Error('Artboard \'id\' property is missing.')
    }

    const dimensions = this._getDimensions().convert()

    return {
      // @ts-ignore
      type: 'ARTBOARD',
      version: await this._getVersion(),
      id: this._sourceArtboard.refId,
      dimensions,
      layers: getConverted(this._layers)
    }
  }
}