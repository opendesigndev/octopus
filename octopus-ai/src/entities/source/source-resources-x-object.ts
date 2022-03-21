import { RawResourcesXObject } from '../../typings/raw'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

export default class SourceResourcesXObject {
  private _rawValue: RawResourcesXObject

  constructor(rawValue: RawResourcesXObject) {
    this._rawValue = rawValue
  }

  get fileName(): Nullable<string> {
    const subType = this.subType ?? ''
    return this._rawValue?.Data?.[subType] as string
  }

  get subType(): Nullable<string> {
    return this._rawValue.Subtype
  }
}
