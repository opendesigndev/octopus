import { OctopusComponent } from '../../entities/octopus/octopus-component'

import type { OctopusPSDConverter } from '../..'
import type { SourceDesign } from '../../entities/source/source-design'
import type { Octopus } from '../../typings/octopus'

export type ComponentConverterOptions = {
  octopusConverter: OctopusPSDConverter
}

export class ComponentConverter {
  _sourceDesign: SourceDesign
  _octopusConverter: OctopusPSDConverter

  constructor(options: ComponentConverterOptions) {
    this._octopusConverter = options.octopusConverter
  }

  convert(): Promise<Octopus['OctopusDocument']> {
    return new OctopusComponent({ octopusConverter: this._octopusConverter }).convert()
  }
}
