import type SourceDesign from './source-design'


type RawGeneralEntry = {
  id: string,
  name: string,
  path: string
}

type RawArtboardSpecific = {
  'uxdesign#bounds': { x: number, y: number, width: number, height: number },
  'uxdesign#viewport': { height: number },
}

type RawArtwork = RawGeneralEntry & {
  children?: (RawGeneralEntry & RawArtboardSpecific)[]
}

export type RawSourceManifest = {
  children?: (RawArtwork)[]
}

type SourceManifestOptions = {
  rawValue: RawSourceManifest,
  path: string,
  design: SourceDesign
}

export default class SourceManifest {
  protected _rawValue: RawSourceManifest
  private _path: string
  private _design: SourceDesign

  constructor(options: SourceManifestOptions) {
    this._design = options.design
    this._rawValue = options.rawValue
    this._path = options.path
  }

  get raw() {
    return this._rawValue
  }

  getArtboardEntryByPartialPath(path: string) {
    const children = this._rawValue.children
    if (!children) return null
    const artwork = children.find(entry => entry.name === 'artwork')
    if (!artwork || !artwork.children) return null
    const artboard = artwork.children.find(artboard => {
      return path.includes(artboard.path)
    })
    return artboard || null
  }
}