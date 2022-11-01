import { OctopusComponent } from '../../entities/octopus/octopus-component.js'

import type { Octopus } from '../../typings/octopus.js'
import type { DesignConverter } from './design-converter.js'

export type ComponentConverterOptions = {
  componentId: string
  designConverter: DesignConverter
}

export class ComponentConverter {
  private _componentId: string
  private _designConverter: DesignConverter

  constructor({ componentId, designConverter }: ComponentConverterOptions) {
    this._componentId = componentId
    this._designConverter = designConverter
  }

  async convert(): Promise<Octopus['OctopusComponent'] | null> {
    const sourceComponent = this._designConverter.sourceDesign.getComponentById(this._componentId)
    if (!sourceComponent) return null
    return new OctopusComponent({ sourceComponent, designConverter: this._designConverter }).convert()
  }
}
