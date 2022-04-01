import type { RawResources, RawResourcesXObject, XObjectSubtype } from '../../typings/raw'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

export default class SourceResourcesXObject {
  private _rawValue: RawResourcesXObject

  constructor(rawValue: RawResourcesXObject) {
    this._rawValue = rawValue
  }

  get fileName(): Nullable<string> {
    const subType = this.subType ?? ''
    const data = this._rawValue?.Data
    if (Array.isArray(data)) {
      return null
    }

    return data?.[subType] as string
  }

  get subType(): Nullable<XObjectSubtype> {
    return this._rawValue.Subtype
  }

  get resources(): Nullable<RawResources> {
    return this._rawValue.Resources
  }

  // todo: write proper type when find out what BBox is
  get BBox(): Nullable<RawResources['BBox']> {
    return this._rawValue.BBox
  }

  get data(): Nullable<RawResourcesXObject['Data']> {
    return this._rawValue.Data
  }
}
