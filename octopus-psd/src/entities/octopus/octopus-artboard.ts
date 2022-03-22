import type { OctopusPSDConverter } from '../..'
import type { Octopus } from '../../typings/octopus'
import { createOctopusLayer, OctopusLayer } from '../../factories/create-octopus-layer'
import type { SourceArtboard } from '../source/source-artboard'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import type { SourceDesign } from '../source/source-design'

type OctopusArtboardOptions = {
  sourceDesign: SourceDesign
  octopusConverter: OctopusPSDConverter
}

export class OctopusArtboard {
  private _sourceDesign: SourceDesign
  private _octopusConverter: OctopusPSDConverter
  private _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    this._octopusConverter = options.octopusConverter
    this._sourceDesign = options.sourceDesign
    this._layers = this._initLayers()
  }

  get parentArtboard(): OctopusArtboard {
    return this
  }

  get sourceArtboard(): SourceArtboard {
    return this._sourceDesign.artboard
  }

  get sourceDesign(): SourceDesign {
    return this._sourceDesign
  }

  get converter(): OctopusPSDConverter {
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

  get dimensions(): { width: number; height: number } {
    const { width, height } = this.sourceArtboard.bounds
    return { width, height }
  }

  get id(): string {
    return this.sourceArtboard.id
  }

  get version(): Promise<string> {
    return this._octopusConverter.pkgVersion
  }

  get layers(): Octopus['Layer'][] {
    return getConverted(this._layers)
  }

  get content(): Octopus['Layer'] {
    const { width, height } = this.dimensions
    return {
      id: `${this.id}:background`,
      type: 'MASK_GROUP',
      maskBasis: 'BODY',
      mask: {
        id: `${this.id}:backgroundMask`,
        type: 'SHAPE',
        visible: false,
        shape: {
          path: { type: 'RECTANGLE', rectangle: { x0: 0, y0: 0, x1: width, y1: height } },
          fills: [{ type: 'COLOR', color: { r: 0, g: 0, b: 0, a: 0 } }],
        },
      },
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
