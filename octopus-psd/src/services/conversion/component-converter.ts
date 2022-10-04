import { OctopusComponent } from '../../entities/octopus/octopus-component'

import type { Octopus } from '../../typings/octopus'
import type { DesignConverter } from './design-converter'

export type ComponentConverterOptions = {
  designConverter: DesignConverter
}

export class ComponentConverter {
  _designConverter: DesignConverter

  constructor(options: ComponentConverterOptions) {
    this._designConverter = options.designConverter
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusComponent({ designConverter: this._designConverter }).convert()
  }
}
