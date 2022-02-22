import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type {
  RawResources,
  RawResourcesProperties,
  RawResourcesExtGState,
  RawResourcesFont,
  RawResourcesFontTextFont,
  RawResourcesColorSpace,
} from '../../typings/raw/resources'

type SourceResourcesOptions = {
  rawValue?: RawResources
}

export default class SourceResources {
  protected _rawValue?: RawResources

  constructor(options: SourceResourcesOptions) {
    this._rawValue = options.rawValue
  }

  get raw(): Nullable<RawResources> {
    return this._rawValue
  }

  get properties(): Nullable<RawResourcesProperties> {
    return this._rawValue?.Properties
  }

  getPropertiesById(id: string): Nullable<RawResourcesProperties[string]> {
    return this.properties?.[id]
  }

  get ExtGState(): Nullable<RawResourcesExtGState> {
    return this._rawValue?.ExtGState
  }

  get font(): Nullable<RawResourcesFont> {
    return this._rawValue?.Font
  }

  getFontById(fontId: string): Nullable<RawResourcesFontTextFont> {
    return this.font?.[fontId]
  }

  get colorSpace(): Nullable<RawResourcesColorSpace> {
    return this._rawValue?.ColorSpace
  }

  getColorSpaceValue(colorspace?: string): Nullable<string | RawResourcesColorSpace[string]> {
    if (!colorspace) {
      return null
    }

    const colorSpaceValue = this.colorSpace?.[colorspace]

    return colorSpaceValue || colorspace
  }
}
