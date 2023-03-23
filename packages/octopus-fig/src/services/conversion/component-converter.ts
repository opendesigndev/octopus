import { OctopusComponent } from '../../entities/octopus/octopus-component.js'

import type { DesignConverter } from './design-converter.js'
import type { SourceComponent } from '../../entities/source/source-component.js'
import type { Octopus } from '../../typings/octopus.js'

export type ComponentConverterOptions = {
  designConverter: DesignConverter
  source: SourceComponent
}

export class ComponentConverter {
  private _designConverter: DesignConverter
  private _source: SourceComponent

  constructor(options: ComponentConverterOptions) {
    this._designConverter = options.designConverter
    this._source = options.source
  }

  convert(): Promise<Octopus['OctopusComponent']> {
    return new OctopusComponent({ designConverter: this._designConverter, source: this._source }).convert()
  }
}
