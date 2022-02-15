import type { RawShapeMask } from '../../typings/raw'
import { SourceEntity } from './source-entity'

export class SourceShapeMask extends SourceEntity {
  protected _rawValue: RawShapeMask | undefined

  constructor(mask: RawShapeMask | undefined) {
    super(mask)
    this._rawValue = mask
  }

  // TODO Remove if not needed in the end
}
