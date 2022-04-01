import path from 'path'
import { asString } from '@avocode/octopus-common/dist/utils/as'
import { traverseAndFind } from '@avocode/octopus-common/dist/utils/common'
import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { RawArtboardEntry, RawArtboardMediaBox } from '../../typings/raw'
import type SourceResources from '../source/source-resources'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type { Artboard, OctopusManifestReport } from '../../typings/manifest'
import type { OctopusAIConverter } from '../..'

type OctopusManifestOptions = {
  octopusAIConverter: OctopusAIConverter
}

export default class OctopusManifest {
  private _octopusAIConverter: OctopusAIConverter
  private _exports: {
    images: Map<string, string>
    artboards: Map<string, string>
  }
  private _basePath: string | null

  static DEFAULT_AI_VERSION = '0'
  static DEFAULT_AI_FILENAME = 'Untitled'

  constructor(options: OctopusManifestOptions) {
    this._octopusAIConverter = options.octopusAIConverter
    this._basePath = null
    this._exports = {
      images: new Map(),
      artboards: new Map(),
    }
  }

  registerBasePath(path: string | undefined): void {
    if (typeof path === 'string') {
      this._basePath = path
    }
  }

  getExportedImageById(id: string): string | undefined {
    return this._exports.images.get(id)
  }

  getExportedRelativeImageById(id: string): string | undefined {
    const imagePath = this._exports.images.get(id)
    if (imagePath === undefined) return undefined
    if (this._basePath === null) return imagePath
    return path.relative(this._basePath, imagePath)
  }

  setExportedImage(id: string, path: string): void {
    this._exports.images.set(id, path)
  }

  getExportedArtboardById(id: string): string | undefined {
    return this._exports.artboards.get(id)
  }

  getExportedRelativeArtboardById(id: string): string | undefined {
    const artboardPath = this._exports.artboards.get(id)
    if (artboardPath === undefined) return undefined
    if (this._basePath === null) return artboardPath
    return path.resolve(this._basePath, artboardPath)
  }

  setExportedArtboard(id: string, path: string): void {
    this._exports.artboards.set(id, path)
  }

  get manifestVersion(): Promise<string> {
    return this._octopusAIConverter.pkg.then((pkg) => pkg.version)
  }

  get AIVersion(): string {
    return asString(this._octopusAIConverter.sourceDesign.metadaData.version, OctopusManifest.DEFAULT_AI_VERSION)
  }

  get name(): string {
    return OctopusManifest.DEFAULT_AI_FILENAME
  }

  private _convertManifestBounds(mediabox: RawArtboardMediaBox) {
    const [x, y, w, h] = mediabox
    return {
      x,
      y,
      w,
      h,
    }
  }

  private _getArtboardAssetsImages(artboardResources: Nullable<SourceResources>): string[] {
    const entries = artboardResources?.images.map((image) => image.fileName) ?? []
    return [...new Set(entries)] as string[]
  }

  private _getArtboardAssetsFonts(raw: Nullable<RawArtboardEntry>): string[] {
    const entries = traverseAndFind(raw?.Resources?.Font ?? {}, (obj: unknown) => {
      return Object(obj)?.BaseFont
    })
    return [...new Set(entries)] as string[]
  }

  private _getArtboardAssets(artboardId: string) {
    const targetArtboard = this._octopusAIConverter.sourceDesign.getArtboardById(artboardId)
    const artboardResources = targetArtboard?.resources
    const raw = targetArtboard?.raw

    const images = this._getArtboardAssetsImages(artboardResources).map((image) => {
      const location = this.getExportedRelativeImageById(image)

      return {
        location:
          typeof location === 'string'
            ? {
                type: 'LOCAL_RESOURCE',
                path: location,
              }
            : {
                type: 'TRANSIENT',
              },
        refId: image,
      }
    })

    const fonts = this._getArtboardAssetsFonts(raw).map((font) => {
      return {
        location: {
          type: 'TRANSIENT',
        },
        name: font,
      }
    })

    return {
      ...(images.length ? { images } : null),
      ...(fonts.length ? { fonts } : null),
    }
  }

  @firstCallMemo()
  get artboards(): Artboard[] {
    return this._octopusAIConverter.sourceDesign.artboards
      .map((artboard) => {
        const id = artboard.id
        if (!id) return null

        const exportLocation = this.getExportedRelativeArtboardById(id)
        /** @TODO how to handle failed artboards? */
        const location =
          typeof exportLocation === 'string'
            ? {
                type: 'LOCAL_RESOURCE',
                path: exportLocation,
              }
            : {
                type: 'TRANSIENT',
              }

        const bounds = this._convertManifestBounds(artboard.mediaBox)

        return {
          id,
          name: artboard.name,
          bounds,
          dependencies: [],
          location,
          assets: this._getArtboardAssets(id),
        }
      })
      .filter((artboardEntry) => artboardEntry) as Artboard[]
  }

  /** @TODO guard with official types */
  async convert(): Promise<OctopusManifestReport> {
    return {
      version: await this.manifestVersion,
      origin: {
        name: 'illustrator',
        version: this.AIVersion,
      },
      name: this.name,
      pages: [],
      artboards: this.artboards,
      components: [],
      chunks: [],
      libraries: [],
    }
  }
}
