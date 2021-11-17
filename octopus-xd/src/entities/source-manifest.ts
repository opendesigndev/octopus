import { deepInspect } from "../utils/common"
import SourceDesign from "./source-design"

type GeneralEntryRaw = {
  id: string,
  name: string,
  path: string
}

type ArtboardSpecificRaw = {
  'uxdesign#bounds': { x: number, y: number, width: number, height: number },
  'uxdesign#viewport': { height: number },
}

type ArtworkRaw = GeneralEntryRaw & {
  children?: (GeneralEntryRaw & ArtboardSpecificRaw)[]
}

export type SourceManifestRaw = {
  children?: (ArtworkRaw)[]
}

type SourceManifestOptions = {
  rawValue: SourceManifestRaw,
  path: string,
  design: SourceDesign
}

export default class SourceManifest {
  _rawValue: SourceManifestRaw
  _path: string
  _design: SourceDesign

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