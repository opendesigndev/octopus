import { createOctopusLayer } from '../../factories/create-octopus-layer'
import { env } from '../../services'
import { convertId } from '../../utils/convert'
import { SourceLayerContainer } from '../source/source-layer-container'
import { OctopusLayerGroup } from './octopus-layer-group'
import { OctopusLayerMaskGroup } from './octopus-layer-mask-group'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import type { SourceComponent } from '../source/source-component'

type OctopusComponentOptions = {
  source: SourceComponent
  version: string
}

export class OctopusComponent {
  private _sourceComponent: SourceComponent
  private _version: string

  constructor(options: OctopusComponentOptions) {
    this._sourceComponent = options.source
    this._version = options.version
  }

  get parentComponent(): OctopusComponent {
    return this
  }

  get sourceComponent(): SourceComponent {
    return this._sourceComponent
  }

  get sourceLayer(): SourceLayer {
    return this.sourceComponent.sourceLayer
  }

  get dimensions(): Octopus['Dimensions'] | undefined {
    const bounds = env.NODE_ENV === 'debug' ? this.sourceComponent.bounds : this.sourceComponent.boundingBox // TODO remove when ISSUE is fixed https://gitlab.avcd.cz/opendesign/open-design-engine/-/issues/21
    if (!bounds) return undefined
    const { width, height } = bounds
    return { width, height }
  }

  get id(): string {
    return convertId(this.sourceComponent.id)
  }

  get version(): string {
    return this._version
  }

  private get _content(): Octopus['Layer'] | undefined {
    const sourceLayer = this.sourceLayer

    if (sourceLayer instanceof SourceLayerContainer) {
      const options = { parent: this, sourceLayer, isTopComponent: true }
      const maskGroup = sourceLayer.hasBackgroundMask
        ? OctopusLayerMaskGroup.createBackgroundMaskGroup(options)
        : new OctopusLayerGroup(options)
      return maskGroup?.convert() ?? undefined
    }

    const layer = createOctopusLayer({ parent: this, layer: sourceLayer })
    return layer?.convert() ?? undefined
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
