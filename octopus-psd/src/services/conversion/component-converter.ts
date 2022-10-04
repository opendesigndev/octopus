import { OctopusComponent } from '../../entities/octopus/octopus-component'

import type { Octopus } from '../../typings/octopus'
import type { DesignConverter } from './design-converter'

export type ComponentConverterOptions = {
  componentId: string
  designConverter: DesignConverter
}

export class ComponentConverter {
  _componentId: string
  _designConverter: DesignConverter

  constructor({ componentId, designConverter }: ComponentConverterOptions) {
    this._componentId = componentId
    this._designConverter = designConverter
  }

  async convert(): Promise<Octopus['OctopusDocument'] | null> {
    const sourceComponent = this._designConverter.sourceDesign.getComponentById(this._componentId)
    if (!sourceComponent) return null
    return new OctopusComponent({ sourceComponent, designConverter: this._designConverter }).convert()
  }
}
