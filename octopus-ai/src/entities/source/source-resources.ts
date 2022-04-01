import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

import type {
  RawResources,
  RawResourcesColorSpace,
  RawResourcesExtGState,
  RawResourcesFont,
  RawResourcesFontTextFont,
  RawResourcesProperties,
  RawResourcesShadingKey,
  RawResourcesShadingKeyFunction,
  RawResourcesShadingKeyFunctionFunction,
} from '../../typings/raw/resources'
import SourceResourcesXObject from './source-resources-x-object'

type SourceResourcesOptions = {
  rawValue?: RawResources
}

type XObjectContainer = { [key: string]: SourceResourcesXObject }

export default class SourceResources {
  static X_OBJECT_IMG_SUBTYPE = 'Image'

  protected _rawValue?: RawResources
  private _xObjectContainer: XObjectContainer

  constructor(options: SourceResourcesOptions) {
    this._rawValue = options.rawValue
    this._xObjectContainer = this._initXObjectContainer()
  }

  private _initXObjectContainer(): XObjectContainer {
    return Object.keys(this._rawValue?.XObject ?? {}).reduce<XObjectContainer>((xObjectContainer, key) => {
      const rawXObject = this._rawValue?.XObject?.[key]
      if (!rawXObject) {
        return xObjectContainer
      }

      return { ...xObjectContainer, [key]: new SourceResourcesXObject(rawXObject) }
    }, {})
  }

  getXObject(key: string): Nullable<SourceResourcesXObject> {
    return this._xObjectContainer[key]
  }

  get images(): SourceResourcesXObject[] {
    return this.xObjects.filter((xObject) => xObject.subType === SourceResources.X_OBJECT_IMG_SUBTYPE)
  }

  get xObjects(): SourceResourcesXObject[] {
    return Object.values(this._xObjectContainer)
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

  getShading(shadingName: string): Nullable<RawResourcesShadingKey> {
    return this._rawValue?.Shading?.[shadingName]
  }

  getShadingCoords(shadingName: string /*, artboardHeight: number*/): Nullable<RawResourcesShadingKey['Coords']> {
    return this.getShading(shadingName)?.Coords ?? [0, 0, 0, 0]
  }

  getShadingType(shadingName: string): Nullable<RawResourcesShadingKey['ShadingType']> {
    return this._rawValue?.Shading?.[shadingName]['ShadingType']
  }

  getShadingColorSpace(shadingName: string): string {
    const colorSpace = this.getShading(shadingName)?.ColorSpace
    return (Array.isArray(colorSpace) ? colorSpace[0] : colorSpace) ?? ''
  }

  getShadingFunction(shadingName: string): Nullable<RawResourcesShadingKeyFunction> {
    return this.getShading(shadingName)?.Function
  }

  getShadingFunctionBounds(shadingName: string): Nullable<RawResourcesShadingKeyFunction['Bounds']> {
    return this.getShadingFunction(shadingName)?.Bounds
  }

  getShadingFunctionFunctions(shadingName: string): Nullable<RawResourcesShadingKeyFunctionFunction[]> {
    return this.getShadingFunction(shadingName)?.Functions
  }

  getShadingFunctionEncode(shadingName: string): Nullable<RawResourcesShadingKeyFunction['Encode']> {
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
