import { createOctopusLayer } from '../../factories/create-octopus-layer'
import { env } from '../../services'
import { convertId } from '../../utils/convert'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { DesignConverter } from '../../services/conversion/design-converter'
import type { Octopus } from '../../typings/octopus'
import type { SourceComponent } from '../source/source-component'
import type { OctopusManifest } from './octopus-manifest'

type OctopusComponentOptions = {
  designConverter: DesignConverter
  source: SourceComponent
}

export class OctopusComponent {
  private _designConverter: DesignConverter
  private _sourceComponent: SourceComponent

  constructor(options: OctopusComponentOptions) {
    this._designConverter = options.designConverter
    this._sourceComponent = options.source
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

  get designConverter(): DesignConverter {
    return this._designConverter
  }

  get octopusManifest(): OctopusManifest {
    return this.designConverter.octopusManifest
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
    return this._designConverter.version
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
