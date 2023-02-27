import { asArray, asString } from '@opendesign/octopus-common/dist/utils/as.js'

import { pathRelative } from '../../utils/fs-path.js'

import type { OctopusXDConverter } from '../../octopus-xd-converter.js'
import type { Manifest } from '../../typings/manifest/index.js'

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

export class OctopusManifest {
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
    return pathRelative(this._basePath, image.path)
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
    return pathRelative(this._basePath, artboard.path)
  }

  setExportedArtboard(id: string, artboard: ArtboardDescriptor): void {
    this._exports.artboards.set(id, artboard)
  }

  get version(): string {
    return this._octopusXdConverter.pkg.manifestSpecVersion
  }

  get meta(): Manifest['OctopusManifestMeta'] {
    const converterVersion = this._octopusXdConverter.pkg.version
    return { converterVersion }
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
      width: bounds.width,
      height: bounds.height,
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
    const fonts = fontDeps.map((font) => {
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

  get components(): Manifest['Component'][] {
    return this.manifestArtboardEntries
      .map((artboard) => {
        const internalId = artboard.id
        if (!internalId) return null

        const sourceArtboard = this._octopusXdConverter.sourceDesign.getArtboardByInternalId(internalId)

        if (!sourceArtboard) return null
        const id = sourceArtboard.meta.id

        const role = artboard.path === 'pasteboard' ? ({ role: 'PASTEBOARD' } as const) : null
        const bounds =
          artboard.path === 'pasteboard' ? null : { bounds: this._convertManifestBounds(artboard['uxdesign#bounds']) }

        const exportLocation = this.getExportedRelativeArtboardPathById(id)
        const location =
          typeof exportLocation === 'string'
            ? ({
                type: 'RELATIVE',
                path: exportLocation,
              } as const)
            : ({
                type: 'RELATIVE',
                path: '',
              } as const)
        const status = this.getExportedArtboardById(id)
        const statusValue = status ? (status.error ? 'FAILED' : 'READY') : 'PENDING'
        const assets = this._getArtboardAssets(id)
        return {
          id,
          name: artboard.name,
          status: {
            value: statusValue,
            ...(status?.error
              ? {
                  code: -1,
                  message: status.error.message,
                  stacktrace: status.error.stack,
                }
              : null),
            ...(typeof status?.time === 'number'
              ? {
                  time: status.time,
                }
              : null),
          },
          ...bounds,
          dependencies: [],
          location,
          ...(assets ? { assets } : null),
          ...role,
        }
      })
      .filter((artboardEntry) => artboardEntry) as Manifest['Component'][]
  }

  /** @TODO guard with official types */
  async convert(): Promise<Manifest['OctopusManifest']> {
    return {
      version: this.version,
      origin: {
        name: 'XD',
        version: this.xdVersion,
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
