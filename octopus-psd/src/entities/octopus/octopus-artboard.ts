import type { OctopusPSDConverter } from '../..'
import type { Octopus } from '../../typings/octopus'
import { createOctopusLayer, OctopusLayer } from '../../factories/create-octopus-layer'
import type { SourceArtboard } from '../source/source-artboard'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'

type OctopusArtboardOptions = {
  sourceArtboard: SourceArtboard
  octopusConverter: OctopusPSDConverter
}

export class OctopusArtboard {
  private _sourceArtboard: SourceArtboard
  private _octopusConverter: OctopusPSDConverter
  private _layers: OctopusLayer[]

  static DEFAULT_ID = '1'

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

  private _initLayers() {
    return this.sourceArtboard.layers.reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer,
      })
      return octopusLayer ? [octopusLayer, ...layers] : layers
    }, [])
  }

  get dimensions() {
    const { width, height } = this.sourceArtboard.bounds
    return { width, height }
  }

  get id() {
    return OctopusArtboard.DEFAULT_ID
  }

  get version() {
    return this._octopusConverter.pkg.then((pkg) => pkg.version)
  }

  get layers(): Octopus['Layer'][] {
    return getConverted(this._layers)
  }

  get content(): Octopus['Layer'] {
    return {
      id: '1:background',
      type: 'GROUP',
      layers: this.layers,
    }
  }

  async convert(): Promise<Octopus['OctopusDocument']> {
    return {
      id: this.id,
      type: 'ARTBOARD',
      version: await this.version,
      dimensions: this.dimensions,
      content: this.content,
    } as Octopus['OctopusDocument']
  }
}
