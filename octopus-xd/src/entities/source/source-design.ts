import { push } from '@avocode/octopus-common/dist/utils/common'

import { Expander } from '../../services/conversion/expander/index.js'
import { PasteboardNormalizer } from '../../services/conversion/pasteboard-normalizer/index.js'
import { SourceArtboard } from './source-artboard.js'
import { SourceInteractions } from './source-interactions.js'
import { SourceManifest } from './source-manifest.js'
import { SourceResources } from './source-resources.js'

import type { RawArtboard, RawArtboardLike, RawPasteboard } from '../../typings/source/index.js'
import type { RawResources } from '../../typings/source/resources.js'
import type { RawSourceInteractions } from './source-interactions.js'
import type { RawSourceManifest } from './source-manifest.js'

type SourceDesignOptions = {
  manifest: {
    path: string
    rawValue: RawSourceManifest
  }
  resources: {
    path: string
    rawValue: RawResources
  }
  interactions: {
    path: string
    rawValue: RawSourceInteractions
  }
  images: {
    path: string
    getImageData: GetImageData
  }[]
  artboards: {
    path: string
    rawValue: RawArtboardLike
  }[]
}

export type GetImageData = () => Promise<Uint8Array>

export class SourceDesign {
  private _manifest: SourceManifest
  private _interactions: SourceInteractions
  private _resources: SourceResources
  private _artboards: SourceArtboard[]
  private _images: { path: string; getImageData: GetImageData }[]

  constructor(options: SourceDesignOptions) {
    this._manifest = new SourceManifest({
      path: options.manifest.path,
      rawValue: options.manifest.rawValue,
      design: this,
    })
    this._resources = new SourceResources({
      path: options.resources.path,
      rawValue: options.resources.rawValue,
      design: this,
    })
    this._interactions = new SourceInteractions({
      path: options.interactions.path,
      rawValue: options.interactions.rawValue,
      design: this,
    })

    const expander = new Expander({ resources: this._resources })

    this._artboards = options.artboards.reduce((artboards, entry) => {
      const rawValue = /pasteboard/.test(entry.path)
        ? new PasteboardNormalizer({
            manifest: this._manifest,
            pasteboard: entry.rawValue as RawPasteboard,
          }).normalize()
        : (entry.rawValue as RawArtboard)

      // expander.expand(rawValue)
      if (!rawValue) return artboards

      const artboard = new SourceArtboard({
        path: entry.path,
        rawValue: expander.expand(rawValue),
        design: this,
      })

      return push(artboards, artboard)
    }, [])

    this._images = options.images
  }

  get images(): {
    path: string
    getImageData: GetImageData
  }[] {
    return this._images
  }

  get manifest(): SourceManifest {
    return this._manifest
  }

  get resources(): SourceResources {
    return this._resources
  }

  get interactions(): SourceInteractions {
    return this._interactions
  }

  get artboards(): SourceArtboard[] {
    return this._artboards
  }

  getArtboardById(id: string): SourceArtboard | null {
    return this._artboards.find((entry) => entry.meta.id === id) || null
  }

  getArtboardByInternalId(id: string): SourceArtboard | null {
    return this._artboards.find((entry) => entry.meta.internalId === id) || null
  }
}
