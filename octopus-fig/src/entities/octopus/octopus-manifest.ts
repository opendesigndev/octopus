import path from 'path'

import { push } from '@avocode/octopus-common/dist/utils/common'

import type { OctopusFigConverter } from '../..'
import type { Manifest } from '../../typings/manifest'
import type { SourceArtboard } from '../source/source-artboard'
import type { SourceDesign } from '../source/source-design'

type OctopusManifestOptions = {
  sourceDesign: SourceDesign
  octopusConverter: OctopusFigConverter
}

type ArtboardDescriptor = {
  path: unknown
  error: Error | null
  time: number | null
}

export class OctopusManifest {
  private _sourceDesign: SourceDesign
  private _octopusConverter: OctopusFigConverter
  private _exports: {
    images: Map<string, string | undefined>
    previews: Map<string, string | undefined>
    artboards: Map<string, ArtboardDescriptor>
    artboardImageMap: Map<string, string[]>
  }

  private _basePath: string | null

  static DEFAULT_FIG_VERSION = '0'
  static DEFAULT_FIG_FILENAME = 'Untitled'

  constructor(options: OctopusManifestOptions) {
    this._sourceDesign = options.sourceDesign
    this._octopusConverter = options.octopusConverter
    this._basePath = null
    this._exports = {
      images: new Map(),
      previews: new Map(),
      artboards: new Map(),
      artboardImageMap: new Map(),
    }
  }

  registerBasePath(path: string | undefined): void {
    if (typeof path === 'string') {
      this._basePath = path
    }
  }

  setExportedImagePath(name: string, path: string | undefined): void {
    this._exports.images.set(name, path)
  }

  getExportedRelativeImagePath(name: string): string | undefined {
    return this._exports.images.get(name)
  }

  setExportedPreviewPath(id: string, path: string | undefined): void {
    this._exports.images.set(id, path)
  }

  getExportedRelativePreviewPath(id: string): string | undefined {
    return this._exports.images.get(id)
  }

  setExportedArtboardImageMap(artboardId: string, imageIds: string[]): void {
    this._exports.artboardImageMap.set(artboardId, imageIds)
  }

  getExportedArtboardImageMap(artboardId: string): string[] | undefined {
    return this._exports.artboardImageMap.get(artboardId)
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

  get figVersion(): string {
    return this._sourceDesign.schemaVersion ?? OctopusManifest.DEFAULT_FIG_VERSION
  }

  get name(): string {
    return this._sourceDesign.name ?? OctopusManifest.DEFAULT_FIG_FILENAME
  }

  private _convertError(error: Error | null | undefined): Manifest['Error'] | undefined {
    if (!error) return undefined
    const UNKNOWN_CODE = -1
    return {
      code: UNKNOWN_CODE,
      message: error.message,
      stacktrace: error.stack ? error.stack.split('\n') : undefined,
    }
  }

  get pages(): Manifest['Page'][] {
    return this._sourceDesign.pages.map((page) => ({
      id: page.id,
      name: page.name,
      children: page.children.map((elem) => ({ id: elem.id, type: 'COMPONENT' })),
    }))
  }

  private _getStatus(source: SourceArtboard): Manifest['Status'] {
    const status = this.getExportedArtboardById(source.id)
    const statusValue = status ? (status.error ? 'FAILED' : 'READY') : 'PROCESSING'
    return {
      value: statusValue,
      error: this._convertError(status?.error),
      time: status?.time ?? undefined,
    }
  }

  private _getAssetImage(imageName: string): Manifest['AssetImage'] | null {
    const path = this.getExportedRelativeImagePath(imageName) ?? ''
    const location = { type: 'RELATIVE' as const, path }
    return { location, refId: imageName }
  }

  private _getAssetImages(imageNames: string[]): Manifest['AssetImage'][] {
    return imageNames.reduce((assetImages, imageName) => {
      const assetImage = this._getAssetImage(imageName)
      return assetImage ? push(assetImages, assetImage) : assetImages
    }, [])
  }

  private _getAssetFonts(fonts: string[]): Manifest['AssetFont'][] {
    return fonts.map((font) => ({ name: font }))
  }

  private _getAssets(source: SourceArtboard): Manifest['Assets'] {
    const imageIds = this.getExportedArtboardImageMap(source.id) ?? []
    const images = this._getAssetImages(imageIds)
    const fonts = this._getAssetFonts(source.dependencies.fonts)
    return { images, fonts }
  }

  private _getPreview(id: string): Manifest['ResourceLocation'] | undefined {
    const previewPath = this.getExportedRelativePreviewPath(id)
    if (!previewPath) return
    return { type: 'RELATIVE', path: previewPath }
  }

  private _getArtboard(source: SourceArtboard): Manifest['Component'] {
    const id = source.id
    const bounds = source.bounds ?? undefined
    const status = this._getStatus(source)

    const path = this.getExportedArtboardRelativePathById(id) ?? ''
    const location: Manifest['ResourceLocation'] = { type: 'RELATIVE', path }
    const assets = this._getAssets(source)
    const preview = this._getPreview(id)

    return {
      id,
      name: source.name,
      role: source.isPasteboard ? 'PASTEBOARD' : 'ARTBOARD', // TODO fix for components
      status,
      bounds,
      dependencies: [],
      preview,
      assets,
      location,
    }
  }

  get components(): Manifest['Component'][] {
    return this._sourceDesign.pages
      .reduce((artboards, page) => push(artboards, ...page.children), [])
      .map((artboard) => this._getArtboard(artboard))
  }

  async convert(): Promise<Manifest['OctopusManifest']> {
    return {
      version: await this.manifestVersion,
      origin: {
        name: 'FIGMA',
        version: this.figVersion,
      },
      name: this.name,
      pages: this.pages,
      components: this.components,
      chunks: [],
      libraries: [],
    }
  }
}
