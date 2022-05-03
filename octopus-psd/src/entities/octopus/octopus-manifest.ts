import path from 'path'

import { asString } from '@avocode/octopus-common/dist/utils/as'
import { traverseAndFind } from '@avocode/octopus-common/dist/utils/common'

import type { OctopusPSDConverter } from '../..'
import type { Manifest } from '../../typings/manifest'
import type { SourceBounds } from '../../typings/source'
import type { SourceDesign } from '../source/source-design'

type OctopusManifestOptions = {
  sourceDesign: SourceDesign
  octopusConverter: OctopusPSDConverter
}

type ArtboardDescriptor = {
  path: unknown
  error: Error | null
  time: number | null
}

export class OctopusManifest {
  private _sourceDesign: SourceDesign
  private _octopusConverter: OctopusPSDConverter
  private _exports: {
    images: Map<string, string>
    artboards: Map<string, ArtboardDescriptor>
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

  getExportedArtboardById(id: string): ArtboardDescriptor | undefined {
    return this._exports.artboards.get(id)
  }

  getExportedArtboardRelativePathById(id: string): string | undefined {
    const artboardResult = this._exports.artboards.get(id)
    if (typeof artboardResult?.path !== 'string') return undefined
    if (this._basePath === null) return artboardResult.path
    return path.relative(this._basePath, artboardResult.path)
  }

  setExportedArtboard(id: string, artboard: ArtboardDescriptor): void {
    this._exports.artboards.set(id, artboard)
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

  private _convertManifestBounds(bounds: SourceBounds): Manifest['Bounds'] {
    const { left: x, top: y, width, height } = bounds
    return { x, y, width, height }
  }

  private _convertError(error: Error | null | undefined): Manifest['Error'] | undefined {
    if (!error) return undefined
    const UNKNOWN_CODE = -1
    return {
      code: UNKNOWN_CODE,
      message: error.message,
      stacktrace: error.stack ? [error.stack] : undefined,
    }
  }

  private _getArtboardAssetsFonts(raw: Record<string, unknown>): string[] {
    const entries = traverseAndFind(raw, (obj: unknown) => {
      return Object(obj)?.fontPostScriptName
    })
    return [...new Set(entries)] as string[]
  }

  private get _artboardAssets(): Manifest['Assets'] | null {
    const targetArtboard = this._octopusConverter.sourceDesign.artboard
    const raw = targetArtboard?.raw
    if (!raw) return null

    const images: Manifest['AssetImage'][] = this._octopusConverter.sourceDesign.images.map((image) => {
      const path = this.getExportedRelativeImageByName(image.name) ?? ''
      const location: Manifest['ResourceLocation'] = { type: 'RELATIVE', path }
      return { location, refId: image.name }
    })

    const fonts: Manifest['AssetFont'][] = this._getArtboardAssetsFonts(raw).map((font) => ({ name: font }))

    return {
      ...(images.length ? { images } : null),
      ...(fonts.length ? { fonts } : null),
    }
  }

  private get _artboard(): Manifest['Component'] {
    const sourceArtboard = this._sourceDesign.artboard
    const id = sourceArtboard.id
    const bounds = this._convertManifestBounds(sourceArtboard.bounds)
    const assets = this._artboardAssets ?? undefined

    const status = this.getExportedArtboardById(id)
    const statusValue = status ? (status.error ? 'FAILED' : 'READY') : 'PROCESSING'

    const path = this.getExportedArtboardRelativePathById(id) ?? ''
    const location: Manifest['ResourceLocation'] = { type: 'RELATIVE', path }

    return {
      id,
      name: id,
      status: {
        value: statusValue,
        error: this._convertError(status?.error),
        time: status?.time ?? undefined,
      },
      bounds,
      dependencies: [],
      assets,
      location,
    }
  }

  async convert(): Promise<Manifest['OctopusManifest']> {
    return {
      version: await this.manifestVersion,
      origin: {
        name: 'PHOTOSHOP',
        version: this.psdVersion,
      },
      name: this.name,
      pages: [],
      components: [this._artboard],
      chunks: [],
      libraries: [],
    }
  }
}
