import type { RawResources } from '../typings/source/resources'
import type SourceDesign from './source-design'


type SourceResourcesOptions = {
  rawValue?: RawResources,
}

export default class SourceResources {
  protected _rawValue?: RawResources

  constructor(options: SourceResourcesOptions) {
    this._rawValue = options.rawValue
  }

  get raw() {
    return this._rawValue
  }

  get properties () {
      return this._rawValue?.Properties
  }

  getPropertiesById(id:string) {
      return this.properties?.[id]
  }

  get ExtGState() {
      return this._rawValue?.ExtGState
  }

  get font () {
      return this._rawValue?.Font
  }

  getFontById(fontId:string){
      return this.font?.[fontId]
  }

  get colorSpace () {
    return this._rawValue?.ColorSpace
  }

  getColorSpaceValue (colorspace?:string) {
    if(!colorspace) {
      return null
    }
    
    const colorSpaceValue = this.colorSpace?.[colorspace]

    return colorSpaceValue || colorspace
    
  }
}