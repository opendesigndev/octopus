import path from 'path'

import { asArray, asString } from '@avocode/octopus-common/dist/utils/as'
import { traverseAndFind } from '@avocode/octopus-common/dist/utils/common'
import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { Artboard, OctopusManifestReport } from '../../typings/manifest'
import type { OctopusXDConverter } from '../..'

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
    images: Map<string, string>
    artboards: Map<string, string>
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

  private _getArtboardAssetsImages(raw: Record<string, unknown>): string[] {
    const entries = traverseAndFind(raw, (obj: unknown) => {
      return Object(obj)?.style?.fill?.pattern?.meta?.ux?.uid
    })
    return [...new Set(entries)] as string[]
  }

  private _getArtboardAssetsFonts(raw: Record<string, unknown>): string[] {
    const entries = traverseAndFind(raw, (obj: unknown) => {
      return Object(obj)?.postscriptName
    })
    return [...new Set(entries)] as string[]
  }

  private _getArtboardAssets(artboardId: string) {
    const targetArtboard = this._octopusXdConverter.sourceDesign.getArtboardById(artboardId)
    const raw = targetArtboard?.raw
    if (!raw) return null

    const images = this._getArtboardAssetsImages(raw).map((image) => {
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
      return { location: { type: 'TRANSIENT' }, name: font }
    })

    return {
      ...(images.length ? { images } : null),
      ...(fonts.length ? { fonts } : null),
    }
  }

  @firstCallMemo()
  get artboards(): Artboard[] {
    return this.manifestArtboardEntries
      .map((artboard) => {
        const id = artboard.id
        if (!id) return null

        const pasteboard = artboard.path === 'pasteboard' ? { isPasteboard: true } : null
        const bounds =
          artboard.path === 'pasteboard' ? null : { bounds: this._convertManifestBounds(artboard['uxdesign#bounds']) }

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

        return {
          id,
          name: artboard.name,
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
