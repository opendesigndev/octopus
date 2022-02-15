import type { RawLayerEffect } from '../../typings/raw'
import { SourceEntity } from './source-entity'

export class SourceLayerEffect extends SourceEntity {
  protected _rawValue: RawLayerEffect | undefined

  constructor(effect: RawLayerEffect | undefined) {
    super(effect)
    this._rawValue = effect
  }

  // TODO Remove if not needed in the end
}
