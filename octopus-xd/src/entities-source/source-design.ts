import SourceInteractions from './source-interactions'
import SourceManifest from './source-manifest'
import SourceResources from './source-resources'
import SourceArtboard from './source-artboard'
import { JSONFromTypedArray } from '../utils/common'
import Expander from '../services/conversion/expander'

import type { RawSourceInteractions } from './source-interactions'
import type { RawSourceManifest } from './source-manifest'
import type { ArrayBuffersSourceTree } from '../typings'
import type { RawArtboard } from '../typings/source'
import type { RawResources } from '../typings/source/resources'


type SourceDesignOptions = {
  manifest: {
    path: string,
    rawValue: RawSourceManifest
  },
  resources: {
    path: string,
    rawValue: RawResources
  },
  interactions: {
    path: string,
    rawValue: RawSourceInteractions
  },
  artboards: {
    path: string,
    rawValue: RawArtboard
  }[]
}

export default class SourceDesign {
  private _manifest: SourceManifest
  private _interactions: SourceInteractions
  private _resources: SourceResources
  private _artboards: SourceArtboard[]

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
        rawValue: JSONFromTypedArray(sourceTree.manifest?.content) as RawSourceManifest
      },
      resources: {
        path: sourceTree.resources?.path,
        rawValue: JSONFromTypedArray(sourceTree.resources?.content) as RawResources
      },
      interactions: {
        path: sourceTree.interactions?.path,
        rawValue: JSONFromTypedArray(sourceTree.interactions?.content) as RawSourceInteractions
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

    const expander = new Expander({
      resources: this._resources
    })

    this._artboards = options.artboards.map(entry => {
      expander.expand(entry.rawValue)
      return new SourceArtboard({
        path: entry.path,
        rawValue: expander.expand(entry.rawValue),
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
    return this._artboards.find(entry => entry.meta.id === id) || null
  }
}