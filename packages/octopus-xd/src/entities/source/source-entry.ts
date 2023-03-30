import type { RawSourceInteractions } from './source-interactions.js'
import type { RawSourceManifest } from './source-manifest.js'
import type { RawArtboardLike } from '../../typings/source/artboard.js'
import type { RawResources } from '../../typings/source/resources.js'

export type SourceEntry = {
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
