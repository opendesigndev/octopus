import path from 'path'

import { firstCallMemo } from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { asString } from '@avocode/octopus-common/dist/utils/as'

import type { OctopusAIConverter } from '../..'
import type { Manifest } from '../../typings/manifest'
import type { RawArtboardMediaBox } from '../../typings/raw'

type OctopusManifestOptions = {
  octopusAIConverter: OctopusAIConverter
}

export class OctopusManifest {
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
    const [x, y, width, height] = mediabox
    return {
      x,
      y,
      width,
      height,
    }
  }

  private _getArtboardAssets(artboardId: string): Manifest['Assets'] {
    const targetArtboard = this._octopusAIConverter.sourceDesign.getArtboardById(artboardId)
    const { fonts: fontsDeps, images: imagesDeps } = targetArtboard?.dependencies || { fonts: [], images: [] }

    const images = imagesDeps.map((image: string) => {
      const location = this.getExportedRelativeImageById(image)
      return {
        location:
          typeof location === 'string'
            ? ({
                type: 'RELATIVE',
                path: location,
              } as const)
            : ({
                type: 'RELATIVE',
                path: '',
              } as const),
        refId: image,
      }
    })

    const fonts = fontsDeps.map((font: string) => {
      return {
        location: {
          type: 'RELATIVE',
          path: '',
        } as const,
        name: font,
      }
    })

    return {
      ...(images.length ? { images } : null),
      ...(fonts.length ? { fonts } : null),
    }
  }

  @firstCallMemo()
  get components(): Manifest['Component'][] {
    return this._octopusAIConverter.sourceDesign.artboards
      .map((artboard) => {
        const id = artboard.id
        if (!id) return null
        const exportLocation = this.getExportedRelativeArtboardById(id)
        const location =
          typeof exportLocation === 'string'
            ? {
                type: 'RELATIVE',
                path: exportLocation,
              }
            : {
                type: 'RELATIVE',
                path: '',
              }

        const bounds = this._convertManifestBounds(artboard.mediaBox)

        return {
          id,
          name: artboard.name,
          bounds,
          dependencies: [],
          location,
          assets: this._getArtboardAssets(id),
          role: 'ARTBOARD',
        }
      })
      .filter((artboardEntry) => artboardEntry) as Manifest['Component'][]
  }

  async convert(): Promise<Manifest['OctopusManifest']> {
    return {
      version: await this.manifestVersion,
      origin: {
        name: 'illustrator',
        version: this.AIVersion,
      },
      name: this.name,
      pages: [],
      components: this.components,
      chunks: [],
      libraries: [],
    }
  }
}
