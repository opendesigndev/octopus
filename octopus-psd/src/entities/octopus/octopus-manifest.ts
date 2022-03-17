import path from 'path'
import { SourceDesign } from '../source/source-design'
import type { Artboard, AssetFont, AssetImage, Assets, OctopusManifestReport } from '../../typings/manifest'
import type { OctopusPSDConverter } from '../..'
import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { SourceBounds } from '../../typings/source'
import { asString } from '@avocode/octopus-common/dist/utils/as'
import { traverseAndFind } from '@avocode/octopus-common/dist/utils/common'

type OctopusManifestOptions = {
  sourceDesign: SourceDesign
  octopusConverter: OctopusPSDConverter
}

export class OctopusManifest {
  private _sourceDesign: SourceDesign
  private _octopusConverter: OctopusPSDConverter
  private _exports: {
    images: Map<string, string>
    artboards: Map<string, string>
  }

  private _basePath: string | null

  static DEFAULT_PSD_VERSION = '0'
  static DEFAULT_PSD_FILENAME = 'Untitled'

  constructor(options: OctopusManifestOptions) {
    this._sourceDesign = options.sourceDesign
    this._octopusConverter = options.octopusConverter
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

  getExportedImageByName(name: string): string | undefined {
    return this._exports.images.get(name)
  }

  getExportedRelativeImageByName(name: string): string | undefined {
    const imagePath = this._exports.images.get(name)
    if (imagePath === undefined) return undefined
    if (this._basePath === null) return imagePath
    return path.relative(this._basePath, imagePath)
  }

  setExportedImage(name: string, path: string): void {
    this._exports.images.set(name, path)
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
    return this._octopusConverter.pkgVersion
  }

  get psdVersion(): string {
    return OctopusManifest.DEFAULT_PSD_VERSION
  }

  get name(): string {
    return asString(this._sourceDesign.designId, OctopusManifest.DEFAULT_PSD_FILENAME)
  }

  private _convertManifestBounds(bounds: SourceBounds) {
    return {
      x: bounds.left,
      y: bounds.top,
      w: bounds.width,
      h: bounds.height,
    }
  }

  private _getArtboardAssetsFonts(raw: Record<string, unknown>): string[] {
    const entries = traverseAndFind(raw, (obj: unknown) => {
      return Object(obj)?.postScriptName
    })
    return [...new Set(entries)] as string[]
  }

  private _getArtboardAssets(): Assets | null {
    const targetArtboard = this._octopusConverter.sourceDesign.artboard
    const raw = targetArtboard?.raw
    if (!raw) return null

    const images: AssetImage[] = this._octopusConverter.sourceDesign.images.map((image) => {
      const location = this.getExportedRelativeImageByName(image.name)
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
        refId: image.name,
      }
    })
    const fonts: AssetFont[] = this._getArtboardAssetsFonts(raw).map((font) => {
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
    const sourceArtboard = this._sourceDesign.artboard
    const id = sourceArtboard.id
    const bounds = this._convertManifestBounds(sourceArtboard.bounds)
    const assets = this._getArtboardAssets() ?? undefined

    const artboard: Artboard = {
      id,
      name: id,
      bounds,
      dependencies: [],
      assets,
      location: { type: 'TRANSIENT' },
    }
    return [artboard]
  }

  /** @TODO guard with official types */
  async convert(): Promise<OctopusManifestReport> {
    return {
      version: await this.manifestVersion,
      origin: {
        name: 'photoshop',
        version: this.psdVersion,
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
