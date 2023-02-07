import path from 'path'

import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo'
import { asString } from '@opendesign/octopus-common/dist/utils/as'

import type { DesignConverter } from '../../services/conversion/design-converter'
import type { Manifest } from '../../typings/manifest'
import type { RawArtboardMediaBox } from '../../typings/raw'

type OctopusManifestOptions = {
  designConverter: DesignConverter
}

export class OctopusManifest {
  private _designConverter: DesignConverter
  private _exports: {
    images: Map<string, string>
    artboards: Map<string, string>
  }
  private _basePath: string | null

  static DEFAULT_AI_VERSION = '0'
  static DEFAULT_AI_FILENAME = 'Untitled'

  constructor(options: OctopusManifestOptions) {
    this._designConverter = options.designConverter
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

    return path.relative(this._basePath, artboardPath)
  }

  setExportedArtboard(id: string, path: string): void {
    this._exports.artboards.set(id, path)
  }

  get version(): string {
    return this._designConverter.octopusAIConverter.pkg.manifestSpecVersion
  }

  get meta(): Manifest['OctopusManifestMeta'] {
    const converterVersion = this._designConverter.octopusAIConverter.pkg.version
    return { converterVersion }
  }

  get AIVersion(): string {
    return asString(this._designConverter.sourceDesign.metadaData.version, OctopusManifest.DEFAULT_AI_VERSION)
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
    const targetArtboard = this._designConverter.sourceDesign.getArtboardById(artboardId)
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
    return this._designConverter.sourceDesign.artboards
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

  convert(): Manifest['OctopusManifest'] {
    return {
      version: this.version,
      origin: {
        name: 'illustrator',
        version: this.AIVersion,
      },
      name: this.name,
      meta: this.meta,
      pages: [],
      components: this.components,
      chunks: [],
      libraries: [],
    }
  }
}
