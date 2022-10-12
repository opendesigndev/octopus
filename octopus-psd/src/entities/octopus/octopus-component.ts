import { createOctopusLayers } from '../../factories/create-octopus-layer'
import { OctopusLayerGroup } from './octopus-layer-group'
import { OctopusLayerMaskGroup } from './octopus-layer-mask-group'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { DesignConverter } from '../../services/conversion/design-converter'
import type { Octopus } from '../../typings/octopus'
import type { SourceBounds } from '../../typings/source'
import type { SourceComponent } from '../source/source-component'
import type { SourceDesign } from '../source/source-design'

type OctopusComponentOptions = {
  sourceComponent: SourceComponent
  designConverter: DesignConverter
}

export class OctopusComponent {
  private _sourceComponent: SourceComponent
  private _designConverter: DesignConverter
  private _layers: OctopusLayer[]

  constructor(options: OctopusComponentOptions) {
    this._sourceComponent = options.sourceComponent
    this._designConverter = options.designConverter
    this._layers = createOctopusLayers(this.sourceComponent.layers, this)
  }

  get parentComponent(): OctopusComponent {
    return this
  }

  get sourceComponent(): SourceComponent {
    return this._sourceComponent
  }

  get sourceDesign(): SourceDesign {
    return this._designConverter.sourceDesign
  }

  get designConverter(): DesignConverter {
    return this._designConverter
  }

  get dimensions(): { width: number; height: number } {
    const { width, height } = this.sourceComponent.bounds
    return { width, height }
  }

  get id(): string {
    return this.sourceComponent.id
  }

  get name(): string {
    return this.sourceComponent.name
  }

  get version(): string {
    return this._designConverter.octopusConverter.pkgVersion
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
    const bounds = this.sourceComponent.bounds

    const hasArtboards = this._layers.length > 1 && !this._layers.every((layer) => !layer.sourceLayer?.isArtboard)
    if (!hasArtboards)
      return this._layers.length > 1
        ? OctopusLayerMaskGroup.createBackground({ parent: this, id, bounds, layers: this._layers })
        : this._getArtboardFromLayer(this._layers[0], bounds)

    const layers = this._layers.map((layer) => this._getArtboardFromLayer(layer))
    return OctopusLayerGroup.createBackground({ id, layers })
  }

  async convert(): Promise<Octopus['OctopusComponent']> {
    return {
      id: this.id,
      type: 'ARTBOARD',
      version: this.version,
      dimensions: this.dimensions,
      content: this.content,
    } as Octopus['OctopusComponent']
  }
}
