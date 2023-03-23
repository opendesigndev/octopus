import { OctopusLayerGroup } from './octopus-layer-group.js'
import { OctopusLayerMaskGroup } from './octopus-layer-mask-group.js'
import { createOctopusLayers } from '../../factories/create-octopus-layer.js'

import type { OctopusLayer } from '../../factories/create-octopus-layer.js'
import type { DesignConverter } from '../../services/conversion/design-converter.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceBounds } from '../../typings/source.js'
import type { SourceComponent } from '../source/source-component.js'
import type { SourceDesign } from '../source/source-design.js'

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
    return this._designConverter.octopusConverter.pkg.octopusSpecVersion
  }

  private _getArtboardFromLayer(layer: OctopusLayer, parentBounds?: SourceBounds): Octopus['MaskGroupLayer'] {
    const id = layer.id
    const bounds = parentBounds ?? layer.sourceLayer?.bounds
    const isArtboard = layer.sourceLayer?.isArtboard
    const visible = layer.sourceLayer.visible
    const transform = this.sourceComponent.isArtboard ? [1, 0, 0, 1, -bounds.left, -bounds.top] : undefined
    const color = this.sourceComponent.isArtboard
      ? this.sourceComponent.artboardColor
      : layer.sourceLayer?.artboardColor ?? null

    const layers = layer.type === 'GROUP' ? (layer as OctopusLayerGroup).layers : [layer]

    const params = { id, parent: this, isArtboard, bounds, color, visible, transform, layers }
    return OctopusLayerMaskGroup.createBackground(params)
  }

  get content(): Octopus['Layer'] {
    const id = this.id
    const bounds = this.sourceComponent.bounds
    const isArtboard = this.sourceComponent.isArtboard
    const transform = isArtboard ? [1, 0, 0, 1, -bounds.left, -bounds.top] : undefined
    const color = isArtboard ? this.sourceComponent.artboardColor : undefined

    const hasArtboards = this._layers.some((layer) => layer.sourceLayer?.isArtboard)
    if (!hasArtboards)
      return this._layers.length > 1
        ? OctopusLayerMaskGroup.createBackground({
            parent: this,
            id,
            bounds,
            color,
            layers: this._layers,
            transform,
          })
        : this._getArtboardFromLayer(this._layers[0], bounds)

    const layers = this._layers.map((layer) => this._getArtboardFromLayer(layer))
    return OctopusLayerGroup.createBackground({ id, layers })
  }

  async convert(): Promise<Octopus['OctopusComponent']> {
    return {
      id: this.id,
      type: 'OCTOPUS_COMPONENT',
      version: this.version,
      dimensions: this.dimensions,
      content: this.content,
    } as Octopus['OctopusComponent']
  }
}
