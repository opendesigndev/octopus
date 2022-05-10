// import { createOctopusLayers } from '../../factories/create-octopus-layer'
// import { OctopusLayerGroup } from './octopus-layer-group'
// import { OctopusLayerMaskGroup } from './octopus-layer-mask-group'

import { SourceArtboard } from '../source/source-artboard'

import type { OctopusFigConverter } from '../..'
import type { Octopus } from '../../typings/octopus'
import type { SourceDesign } from '../source/source-design'
// import type { OctopusLayer } from '../../factories/create-octopus-layer'
// import type { SourceBounds } from '../../typings/source'
// import type { SourceArtboard } from '../source/source-artboard'

type OctopusArtboardOptions = {
  targetArtboardId: string
  octopusConverter: OctopusFigConverter
}

export class OctopusArtboard {
  private _octopusConverter: OctopusFigConverter
  private _sourceArtboard: SourceArtboard
  // private _layers: OctopusLayer[]
  private _layers: []

  constructor(options: OctopusArtboardOptions) {
    const artboard = options.octopusConverter.sourceDesign.getArtboardById(options.targetArtboardId)
    if (!artboard) {
      throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
    }
    this._sourceArtboard = artboard
    this._octopusConverter = options.octopusConverter
    this._layers = []
    // this._layers = createOctopusLayers(this.sourceArtboard.layers, this)
  }

  get parentArtboard(): OctopusArtboard {
    return this
  }

  get sourceDesign(): SourceDesign {
    return this._octopusConverter.sourceDesign
  }

  get sourceArtboard(): SourceArtboard {
    return this._sourceArtboard
  }

  get converter(): OctopusFigConverter {
    return this._octopusConverter
  }

  // get dimensions(): { width: number; height: number } {
  //   const { width, height } = this.sourceArtboard.bounds
  //   return { width, height }
  // }

  get id(): string {
    return 'TODO'
    // return this.sourceArtboard.id
  }

  get version(): Promise<string> {
    return this._octopusConverter.pkgVersion
  }

  // private _getArtboardFromLayer(layer: OctopusLayer, parentBounds?: SourceBounds): Octopus['MaskGroupLayer'] {
  //   const id = layer.id
  //   const bounds = parentBounds ?? layer.sourceLayer?.bounds
  //   const color = layer.sourceLayer?.artboardColor ?? null
  //   const isArtboard = layer.sourceLayer?.isArtboard
  //   const visible = layer.sourceLayer.visible
  //   const layers = layer.type === 'GROUP' ? (layer as OctopusLayerGroup).layers : [layer]
  //   return OctopusLayerMaskGroup.createBackground({ parent: this, id, bounds, color, isArtboard, visible, layers })
  // }

  // get content(): Octopus['Layer'] {
  //   const id = this.id
  //   const bounds = this.sourceArtboard.bounds

  //   const hasArtboards = this._layers.length > 1 && !this._layers.every((layer) => !layer.sourceLayer?.isArtboard)
  //   if (!hasArtboards)
  //     return this._layers.length > 1
  //       ? OctopusLayerMaskGroup.createBackground({ parent: this, id, bounds, layers: this._layers })
  //       : this._getArtboardFromLayer(this._layers[0], bounds)

  //   const layers = this._layers.map((layer) => this._getArtboardFromLayer(layer))
  //   return OctopusLayerGroup.createBackground({ id, layers })
  // }

  async convert(): Promise<Octopus['OctopusDocument']> {
    return {
      id: this.id,
      type: 'ARTBOARD',
      version: await this.version,
      // dimensions: this.dimensions,
      // content: this.content,
      content: {} as any,
    } as Octopus['OctopusDocument']
  }
}
