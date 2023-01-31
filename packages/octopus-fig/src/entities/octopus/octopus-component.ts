import { createOctopusLayer } from '../../factories/create-octopus-layer'
import { env } from '../../services'
import { convertId } from '../../utils/convert'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import type { SourceComponent } from '../source/source-component'
import type { OctopusManifest } from './octopus-manifest'

type OctopusComponentOptions = {
  manifest: OctopusManifest
  source: SourceComponent
  version: string
}

export class OctopusComponent {
  private _octopusManifest: OctopusManifest
  private _sourceComponent: SourceComponent
  private _version: string

  constructor(options: OctopusComponentOptions) {
    this._octopusManifest = options.manifest
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

  get octopusManifest(): OctopusManifest {
    return this._octopusManifest
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

  private async _content(): Promise<Octopus['Layer'] | undefined> {
    const sourceLayer = this.sourceLayer
    const layer = createOctopusLayer({ parent: this, layer: sourceLayer })
    const converted = await layer?.convert()
    return converted ?? undefined
  }

  async convert(): Promise<Octopus['OctopusComponent']> {
    return {
      id: this.id,
      type: 'OCTOPUS_COMPONENT',
      version: this.version,
      dimensions: this.dimensions,
      content: await this._content(),
    } as Octopus['OctopusComponent']
  }
}
