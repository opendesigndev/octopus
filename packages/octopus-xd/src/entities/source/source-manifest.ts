import type { SourceDesign } from './source-design.js'

export type RawGeneralEntry = {
  id: string
  name: string
  path: string
}

export type RawArtboardSpecific = {
  'uxdesign#bounds': { x: number; y: number; width: number; height: number }
  'uxdesign#viewport': { height: number }
}

type RawArtwork = RawGeneralEntry & {
  children?: (RawGeneralEntry & RawArtboardSpecific)[]
}

export type RawSourceManifest = {
  children?: RawArtwork[]
  'uxdesign#version'?: string
  name?: string
}

type SourceManifestOptions = {
  rawValue: RawSourceManifest
  path: string
  design: SourceDesign
}

export class SourceManifest {
  protected _rawValue: RawSourceManifest
  private _path: string
  private _design: SourceDesign

  constructor(options: SourceManifestOptions) {
    this._design = options.design
    this._rawValue = options.rawValue
    this._path = options.path
  }

  get raw(): RawSourceManifest {
    return this._rawValue
  }

  get xdVersion(): RawSourceManifest['uxdesign#version'] {
    return this._rawValue?.['uxdesign#version']
  }

  get name(): RawSourceManifest['name'] {
    return this._rawValue?.name
  }

  getArtboardEntryByPartialPath(path: string): (RawGeneralEntry & RawArtboardSpecific) | null {
    const children = this._rawValue.children
    if (!children) return null
    const artwork = children.find((entry) => entry.name === 'artwork')
    if (!artwork || !artwork.children) return null
    const artboard = artwork.children.find((artboard) => {
      return path.includes(artboard.path)
    })
    return artboard || null
  }
}
