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
  RawResourcesXObject,
} from '../../typings/raw'
import type { Nullish } from '@opendesign/octopus-common/utility-types'

type SourceResourcesOptions = {
  rawValue?: RawResources
}

export class SourceResources {
  protected _rawValue?: RawResources

  constructor(options: SourceResourcesOptions) {
    this._rawValue = options.rawValue
  }

  get raw(): Nullish<RawResources> {
    return this._rawValue
  }

  get properties(): Nullish<RawResourcesProperties> {
    return this._rawValue?.Properties
  }

  getXObjectByName(name: string): Nullish<RawResourcesXObject> {
    return this._rawValue?.XObject?.[name]
  }

  getPropertiesById(id: string): Nullish<RawResourcesProperties[string]> {
    return this.properties?.[id]
  }

  get externalGraphicState(): Nullish<RawResourcesExtGState> {
    return this._rawValue?.ExtGState
  }

  get font(): Nullish<RawResourcesFont> {
    return this._rawValue?.Font
  }

  getFontById(fontId: string): Nullish<RawResourcesFontTextFont> {
    return this.font?.[fontId]
  }

  get colorSpace(): Nullish<RawResourcesColorSpace> {
    return this._rawValue?.ColorSpace
  }

  getShading(shadingName: string): Nullish<RawResourcesShadingKey> {
    return this._rawValue?.Shading?.[shadingName]
  }

  getShadingCoords(shadingName: string): Nullish<RawResourcesShadingKey['Coords']> {
    return this.getShading(shadingName)?.Coords ?? [0, 0, 0, 0]
  }

  getShadingType(shadingName: string): Nullish<RawResourcesShadingKey['ShadingType']> {
    return this._rawValue?.Shading?.[shadingName]['ShadingType']
  }

  getShadingColorSpace(shadingName: string): string {
    const colorSpace = this.getShading(shadingName)?.ColorSpace
    return (Array.isArray(colorSpace) ? colorSpace[0] : colorSpace) ?? ''
  }

  getShadingFunction(shadingName: string): Nullish<RawResourcesShadingKeyFunction> {
    return this.getShading(shadingName)?.Function
  }

  getShadingFunctionBounds(shadingName: string): Nullish<RawResourcesShadingKeyFunction['Bounds']> {
    return this.getShadingFunction(shadingName)?.Bounds
  }

  getShadingFunctionFunctions(shadingName: string): Nullish<RawResourcesShadingKeyFunctionFunction[]> {
    return this.getShadingFunction(shadingName)?.Functions
  }

  getShadingFunctionEncode(shadingName: string): Nullish<RawResourcesShadingKeyFunction['Encode']> {
    return this.getShadingFunction(shadingName)?.Encode
  }

  getColorSpaceValue(colorspace?: string): Nullish<string | RawResourcesColorSpace[string]> {
    if (!colorspace) {
      return null
    }

    const colorSpaceValue = this.colorSpace?.[colorspace]

    return colorSpaceValue || colorspace
  }
}
