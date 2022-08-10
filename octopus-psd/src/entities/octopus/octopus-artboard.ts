import { createOctopusLayers } from '../../factories/create-octopus-layer.js'
import { OctopusLayerGroup } from './octopus-layer-group.js'
import { OctopusLayerMaskGroup } from './octopus-layer-mask-group.js'

import type { OctopusPSDConverter } from '../../index.js'
import type { OctopusLayer } from '../../factories/create-octopus-layer.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceBounds } from '../../typings/source.js'
import type { SourceArtboard } from '../source/source-artboard.js'
import type { SourceDesign } from '../source/source-design.js'

type OctopusArtboardOptions = {
  octopusConverter: OctopusPSDConverter
}

export class OctopusArtboard {
  private _octopusConverter: OctopusPSDConverter
  private _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    this._octopusConverter = options.octopusConverter
    this._layers = createOctopusLayers(this.sourceArtboard.layers, this)
  }

  get parentArtboard(): OctopusArtboard {
    return this
  }

  get sourceArtboard(): SourceArtboard {
    return this.sourceDesign.artboard
  }

  get sourceDesign(): SourceDesign {
    return this._octopusConverter.sourceDesign
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

  private _getArtboardFromLayer(layer: OctopusLayer, parentBounds?: SourceBounds): Octopus['MaskGroupLayer'] {
    const id = layer.id
    const bounds = parentBounds ?? layer.sourceLayer?.bounds
    const color = layer.sourceLayer?.artboardColor ?? null
    const isArtboard = layer.sourceLayer?.isArtboard
    const visible = layer.sourceLayer.visible
    const layers = layer.type === 'GROUP' ? (layer as OctopusLayerGroup).layers : [layer]
    return OctopusLayerMaskGroup.createBackground({ parent: this, id, bounds, color, isArtboard, visible, layers })
  }

  get content(): Octopus['Layer'] {
    const id = this.id
    const bounds = this.sourceArtboard.bounds

    const hasArtboards = this._layers.length > 1 && !this._layers.every((layer) => !layer.sourceLayer?.isArtboard)
    if (!hasArtboards)
      return this._layers.length > 1
        ? OctopusLayerMaskGroup.createBackground({ parent: this, id, bounds, layers: this._layers })
        : this._getArtboardFromLayer(this._layers[0], bounds)

    const layers = this._layers.map((layer) => this._getArtboardFromLayer(layer))
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
