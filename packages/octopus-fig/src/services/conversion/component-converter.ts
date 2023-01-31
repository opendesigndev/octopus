import { OctopusComponent } from '../../entities/octopus/octopus-component'

import type { OctopusManifest } from '../../entities/octopus/octopus-manifest'
import type { SourceComponent } from '../../entities/source/source-component'
import type { Octopus } from '../../typings/octopus'

export type ComponentConverterOptions = {
  manifest: OctopusManifest
  source: SourceComponent
  version: string
}

export class ComponentConverter {
  private _octopusManifest: OctopusManifest
  private _source: SourceComponent
  private _version: string

  constructor(options: ComponentConverterOptions) {
    this._octopusManifest = options.manifest
    this._source = options.source
    this._version = options.version
  }

  convert(): Promise<Octopus['OctopusComponent']> {
    const component = new OctopusComponent({
      manifest: this._octopusManifest,
      source: this._source,
      version: this._version,
    })

    return component.convert()
  }
}
