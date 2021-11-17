import SourceArtboard from './source-artboard'
import SourceInteractions, { SourceInteractionsRaw } from './source-interactions'
import SourceManifest, { SourceManifestRaw } from './source-manifest'
import SourceResources, { SourceResourcesRaw } from './source-resources'

import type { ArrayBuffersSourceTree } from '../typings'
import { JSONFromTypedArray } from '../utils/common'
import { RawArtboard } from '../typings/source'


type SourceDesignOptions = {
  manifest: {
    path: string,
    rawValue: SourceManifestRaw
  },
  resources: {
    path: string,
    rawValue: SourceResourcesRaw
  },
  interactions: {
    path: string,
    rawValue: SourceInteractionsRaw
  },
  artboards: {
    path: string,
    rawValue: RawArtboard
  }[]
}

export default class SourceDesign {
  _manifest: SourceManifest
  _interactions: SourceInteractions
  _resources: SourceResources
  _artboards: SourceArtboard[]

  static fromUnzippedBuffers(sourceTree: ArrayBuffersSourceTree) {
    if (!sourceTree.manifest?.content) {
      throw new Error('Missing "manifest" ArrayBuffer entry from the source design.')
    }

    if (!sourceTree.interactions?.content) {
      throw new Error('Missing "interactions" ArrayBuffer entry from the source design.')
    }

    if (!sourceTree.resources?.content) {
      throw new Error('Missing "resources" ArrayBuffer entry from the source design.')
    }

    const options = {
      manifest: {
        path: sourceTree.manifest?.path,
        rawValue: JSONFromTypedArray(sourceTree.manifest?.content) as SourceManifestRaw
      },
      resources: {
        path: sourceTree.resources?.path,
        rawValue: JSONFromTypedArray(sourceTree.resources?.content) as SourceResourcesRaw
      },
      interactions: {
        path: sourceTree.interactions?.path,
        rawValue: JSONFromTypedArray(sourceTree.interactions?.content) as SourceInteractionsRaw
      },
      artboards: sourceTree.artboards.map(entry => {
        return {
          path: entry.path,
          rawValue: JSONFromTypedArray(entry.content) as RawArtboard
        }
      })
    }

    return new this(options)
  }

  constructor(options: SourceDesignOptions) {
    this._manifest = new SourceManifest({
      path: options.manifest.path,
      rawValue: options.manifest.rawValue,
      design: this
    })
    this._resources = new SourceResources({
      path: options.resources.path,
      rawValue: options.resources.rawValue,
      design: this
    })
    this._interactions = new SourceInteractions({
      path: options.interactions.path,
      rawValue: options.interactions.rawValue,
      design: this
    })
    this._artboards = options.artboards.map(entry => {
      return new SourceArtboard({
        path: entry.path,
        rawValue: entry.rawValue,
        design: this
      })
    })
  }

  get manifest() {
    return this._manifest
  }

  get resources() {
    return this._resources
  }

  get interactions() {
    return this._interactions
  }

  get artboards() {
    return this._artboards
  }

  getArtboardById(id: string) {
    const artboard = this._artboards.find(entry => {
      return entry.meta.id === id
    })
    return artboard || null
  }
}