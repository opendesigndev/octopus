import { push } from '@avocode/octopus-common/dist/utils/common'

import Expander from '../../services/conversion/expander'
import PasteboardNormalizer from '../../services/conversion/pasteboard-normalizer'
import SourceInteractions from './source-interactions'
import SourceManifest from './source-manifest'
import SourceResources from './source-resources'
import SourceArtboard from './source-artboard'

import type { RawResources } from '../../typings/source/resources'
import type { RawArtboard, RawArtboardLike, RawPasteboard } from '../../typings/source'
import type { RawSourceManifest } from './source-manifest'
import type { RawSourceInteractions } from './source-interactions'

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
    getImageData: () => Promise<Buffer>
  }[]
  artboards: {
    path: string
    rawValue: RawArtboardLike
  }[]
}

export default class SourceDesign {
  private _manifest: SourceManifest
  private _interactions: SourceInteractions
  private _resources: SourceResources
  private _artboards: SourceArtboard[]
  private _images: { path: string; getImageData: () => Promise<Buffer> }[]

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
    getImageData: () => Promise<Buffer>
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
}
