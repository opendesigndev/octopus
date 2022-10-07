import { createOctopusLayers } from '../../factories/create-octopus-layer'
import { env } from '../../services'
import { convertId } from '../../utils/convert'
import { OctopusLayerGroup } from './octopus-layer-group'
import { OctopusLayerMaskGroup } from './octopus-layer-mask-group'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type { SourceComponent } from '../source/source-component'

type OctopusComponentOptions = {
  source: SourceComponent
  version: string
}

export class OctopusComponent {
  private _source: SourceComponent
  private _version: string
  private _layers: OctopusLayer[]

  constructor(options: OctopusComponentOptions) {
    this._source = options.source
    this._version = options.version
    this._layers = createOctopusLayers(this.source.layers, this)
  }

  get parentComponent(): OctopusComponent {
    return this
  }

  get source(): SourceComponent {
    return this._source
  }

  get dimensions(): Octopus['Dimensions'] | undefined {
    const bounds = env.NODE_ENV === 'debug' ? this.source.bounds : this.source.boundingBox // TODO remove when ISSUE is fixed https://gitlab.avcd.cz/opendesign/open-design-engine/-/issues/21
    if (!bounds) return undefined
    const { width, height } = bounds
    return { width, height }
  }

  get id(): string {
    return convertId(this.source.id)
  }

  get version(): string {
    return this._version
  }

  get layers(): OctopusLayer[] {
    return this._layers
  }

  private get _content(): Octopus['MaskGroupLayer'] | Octopus['GroupLayer'] | undefined {
    const sourceLayer = this.source.sourceFrame
    const maskGroup = sourceLayer.hasBackgroundMask
      ? OctopusLayerMaskGroup.createBackgroundMaskGroup({ parent: this, sourceLayer, isTopComponent: true })
      : new OctopusLayerGroup({ parent: this, sourceLayer, isTopComponent: true })
    return maskGroup?.convert() ?? undefined
  }

  async convert(): Promise<Octopus['OctopusComponent']> {
    return {
      id: this.id,
      type: 'ARTBOARD',
      version: this.version,
      dimensions: this.dimensions,
      content: this._content,
    } as Octopus['OctopusComponent']
  }
}
