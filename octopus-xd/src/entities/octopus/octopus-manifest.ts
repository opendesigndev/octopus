import path from 'path'

import { asArray, asString } from '@avocode/octopus-common/dist/utils/as'

import type { Artboard, OctopusManifestReport } from '../../typings/manifest'
import type { OctopusXDConverter } from '../..'

type ImageDescriptor = { path: unknown }

type ArtboardDescriptor = {
  path: unknown
  error: Error | null
  time: number | null
}

type OctopusManifestOptions = {
  octopusXdConverter: OctopusXDConverter
}

type RawManifestBounds = {
  x: number
  y: number
  width: number
  height: number
}

export default class OctopusManifest {
  private _octopusXdConverter: OctopusXDConverter
  private _exports: {
    images: Map<string, ImageDescriptor>
    artboards: Map<string, ArtboardDescriptor>
  }
  private _basePath: string | null

  static DEFAULT_XD_VERSION = '0'
  static DEFAULT_XD_FILENAME = 'Untitled'

  constructor(options: OctopusManifestOptions) {
    this._octopusXdConverter = options.octopusXdConverter
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

  getExportedImageById(id: string): ImageDescriptor | undefined {
    return this._exports.images.get(id)
  }

  getExportedRelativeImagePathById(id: string): string | undefined {
    const image = this._exports.images.get(id)
    if (typeof image?.path !== 'string') return undefined
    if (this._basePath === null) return image.path
    return path.relative(this._basePath, image.path)
  }

  setExportedImage(id: string, imageDescriptor: ImageDescriptor): void {
    this._exports.images.set(id, imageDescriptor)
  }

  getExportedArtboardById(id: string): ArtboardDescriptor | undefined {
    return this._exports.artboards.get(id)
  }

  getExportedRelativeArtboardPathById(id: string): string | undefined {
    const artboard = this._exports.artboards.get(id)
    if (typeof artboard?.path !== 'string') return undefined
    if (this._basePath === null) return artboard.path
    return path.relative(this._basePath, artboard.path)
  }

  setExportedArtboard(id: string, artboard: ArtboardDescriptor): void {
    this._exports.artboards.set(id, artboard)
  }

  get manifestVersion(): Promise<string> {
    return this._octopusXdConverter.pkg.then((pkg) => pkg.version)
  }

  get xdVersion(): string {
    return asString(this._octopusXdConverter.sourceDesign.manifest.xdVersion, OctopusManifest.DEFAULT_XD_VERSION)
  }

  get name(): string {
    return asString(this._octopusXdConverter.sourceDesign.manifest.name, OctopusManifest.DEFAULT_XD_FILENAME)
  }

  private _convertManifestBounds(bounds: RawManifestBounds) {
    return {
      x: bounds.x,
      y: bounds.y,
      w: bounds.width,
      h: bounds.height,
    }
  }

  private get manifestArtboardEntries() {
    const hasPasteboard = this._octopusXdConverter.sourceDesign.artboards.find((artboard) => {
      return /pasteboard/.test(artboard.path)
    })
    const artwork = asArray(this._octopusXdConverter.sourceDesign.manifest.raw?.children).find((child) => {
      return child.path === 'artwork'
    })
    if (!artwork) return []
    return asArray(
      artwork.children?.filter((child) => {
        return /^artboard-/.test(child.path) || (hasPasteboard && /pasteboard/.test(child.path))
      }),
      []
    )
  }

  private _getArtboardAssets(artboardId: string) {
    const targetArtboard = this._octopusXdConverter.sourceDesign.getArtboardById(artboardId)
    if (!targetArtboard) return null

    const { images: imageDeps, fonts: fontDeps } = targetArtboard.dependencies

    const images = imageDeps.map((image) => {
      const location = this.getExportedRelativeImagePathById(image)
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
    const fonts = fontDeps.map((font) => {
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

  get artboards(): Artboard[] {
    return this.manifestArtboardEntries
      .map((artboard) => {
        const id = artboard.id
        if (!id) return null

        const pasteboard = artboard.path === 'pasteboard' ? { isPasteboard: true } : null
        const bounds =
          artboard.path === 'pasteboard' ? null : { bounds: this._convertManifestBounds(artboard['uxdesign#bounds']) }

        const exportLocation = this.getExportedRelativeArtboardPathById(id)
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
        const status = this.getExportedArtboardById(id)
        const statusValue = status ? (status.error ? 'FAILED' : 'READY') : 'PENDING'
        return {
          id,
          name: artboard.name,
          status: {
            value: statusValue,
            error: status?.error ?? null,
            time: status?.time ?? null,
          },
          ...bounds,
          dependencies: [],
          location,
          assets: this._getArtboardAssets(id),
          ...pasteboard,
        }
      })
      .filter((artboardEntry) => artboardEntry) as Artboard[]
  }

  /** @TODO guard with official types */
  async convert(): Promise<OctopusManifestReport> {
    return {
      version: await this.manifestVersion,
      origin: {
        name: 'xd',
        version: this.xdVersion,
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
