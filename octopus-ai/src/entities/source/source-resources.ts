import { isArray } from 'lodash'

import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type {
  RawResources,
  RawResourcesProperties,
  RawResourcesExtGState,
  RawResourcesFont,
  RawResourcesFontTextFont,
  RawResourcesColorSpace,
  RawResourcesShadingKey,
  RawResourcesShadingKeyFunction,
  RawResourcesShadingKeyFunctionFunction,
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

  public getShading(shadingName: string): Nullable<RawResourcesShadingKey> {
    return this._rawValue?.Shading?.[shadingName]
  }

  public getShadingCoords(
    shadingName: string /*, artboardHeight: number*/
  ): Nullable<RawResourcesShadingKey['Coords']> {
    return this.getShading(shadingName)?.Coords ?? [0, 0, 0, 0]
  }

  public getShadingType(shadingName: string): Nullable<RawResourcesShadingKey['ShadingType']> {
    return this._rawValue?.Shading?.[shadingName]['ShadingType']
  }

  public getShadingColorSpace(shadingName: string): string {
    const colorSpace = this.getShading(shadingName)?.ColorSpace
    return (isArray(colorSpace) ? colorSpace[0] : colorSpace) ?? ''
  }

  public getShadingFunction(shadingName: string): Nullable<RawResourcesShadingKeyFunction> {
    return this.getShading(shadingName)?.Function
  }

  public getShadingFunctionBounds(shadingName: string): Nullable<RawResourcesShadingKeyFunction['Bounds']> {
    return this.getShadingFunction(shadingName)?.Bounds
  }

  public getShadingFunctionFunctions(shadingName: string): Nullable<RawResourcesShadingKeyFunctionFunction[]> {
    return this.getShadingFunction(shadingName)?.Functions
  }

  public getShadingFunctionEncode(shadingName: string): Nullable<RawResourcesShadingKeyFunction['Encode']> {
    return this.getShadingFunction(shadingName)?.Encode
  }

  getColorSpaceValue(colorspace?: string): Nullable<string | RawResourcesColorSpace[string]> {
    if (!colorspace) {
      return null
    }

    const colorSpaceValue = this.colorSpace?.[colorspace]

    return colorSpaceValue || colorspace
  }
}
