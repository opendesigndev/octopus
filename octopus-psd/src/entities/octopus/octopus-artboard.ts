import type { OctopusPSDConverter } from '../..'
import { createOctopusLayers, OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type { SourceArtboard } from '../source/source-artboard'
import type { SourceDesign } from '../source/source-design'
import { OctopusLayerGroup } from './octopus-layer-group'
import { OctopusLayerMaskGroup } from './octopus-layer-mask-group'

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
    this._layers = createOctopusLayers(this.sourceArtboard.layers, this)
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

  get content(): Octopus['Layer'] {
    const id = this.id
    const bounds = this.sourceArtboard.bounds

    const hasArtboards = !this._layers.every((layer) => !layer.sourceLayer?.isArtboard)
    if (!hasArtboards) return OctopusLayerMaskGroup.createBackground({ parent: this, id, bounds, layers: this._layers })

    const layers = this._layers.map((layer) => {
      const id = layer.id
      const bounds = layer.sourceLayer?.bounds
      const color = layer.sourceLayer?.artboardColor ?? null
      const isArtboard = layer.sourceLayer?.isArtboard
      return OctopusLayerMaskGroup.createBackground({ parent: this, id, bounds, color, isArtboard, layers: [layer] })
    })
    return OctopusLayerGroup.createBackground({ id, layers })
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
