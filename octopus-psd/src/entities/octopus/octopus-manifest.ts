import path from 'path'

import { asString } from '@avocode/octopus-common/dist/utils/as'
import { traverseAndFind } from '@avocode/octopus-common/dist/utils/common'

import type { OctopusPSDConverter } from '../..'
import type { Manifest } from '../../typings/manifest'
import type { SourceBounds } from '../../typings/source'
import type { SourceComponent } from '../source/source-component'
import type { SourceDesign } from '../source/source-design'

type OctopusManifestOptions = {
  sourceDesign: SourceDesign
  octopusConverter: OctopusPSDConverter
}

type ComponentDescriptor = {
  path: unknown
  error: Error | null
  time: number | null
}

export class OctopusManifest {
  private _sourceDesign: SourceDesign
  private _octopusConverter: OctopusPSDConverter
  private _exports: {
    images: Map<string, string>
    components: Map<string, ComponentDescriptor>
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
      components: new Map(),
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

  getExportedComponentById(id: string): ComponentDescriptor | undefined {
    return this._exports.components.get(id)
  }

  getExportedComponentRelativePathById(id: string): string | undefined {
    const componentResult = this._exports.components.get(id)
    if (typeof componentResult?.path !== 'string') return undefined
    if (this._basePath === null) return componentResult.path
    return path.relative(this._basePath, componentResult.path)
  }

  setExportedComponent(id: string, component: ComponentDescriptor): void {
    this._exports.components.set(id, component)
  }

  get manifestVersion(): string {
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

  private _getComponentAssetsFonts(raw: Record<string, unknown>): string[] {
    const entries = traverseAndFind(raw, (obj: unknown) => Object(obj)?.fontPostScriptName)
    return [...new Set(entries)] as string[]
  }

  private _getComponentAssets(targetComponent: SourceComponent): Manifest['Assets'] | null {
    const raw = targetComponent?.raw
    if (!raw) return null

    const images: Manifest['AssetImage'][] = this._sourceDesign.images.map((image) => {
      const path = this.getExportedRelativeImageByName(image.name) ?? ''
      const location: Manifest['ResourceLocation'] = { type: 'RELATIVE', path }
      return { location, refId: image.name }
    })

    const fonts: Manifest['AssetFont'][] = this._getComponentAssetsFonts(raw).map((font) => ({ name: font }))

    return {
      ...(images.length ? { images } : null),
      ...(fonts.length ? { fonts } : null),
    }
  }

  private _convertComponent(sourceComponent: SourceComponent): Manifest['Component'] {
    const id = sourceComponent.id
    const name = sourceComponent.name
    const role = sourceComponent.isPasteboard ? 'PASTEBOARD' : 'ARTBOARD'

    const compDescriptor = this.getExportedComponentById(id)
    const status = {
      value: compDescriptor ? (compDescriptor.error ? 'FAILED' : 'READY') : 'PROCESSING',
      error: this._convertError(compDescriptor?.error),
      time: compDescriptor?.time ?? undefined,
    } as const

    const bounds = this._convertManifestBounds(sourceComponent.bounds)
    const dependencies: Manifest['Component']['dependencies'] = []
    const assets = this._getComponentAssets(sourceComponent) ?? undefined

    const path = this.getExportedComponentRelativePathById(id) ?? ''
    const location: Manifest['ResourceLocation'] = { type: 'RELATIVE', path }

    return { id, name, role, status, bounds, dependencies, assets, location }
  }

  private get _components(): Manifest['Component'][] {
    return this._sourceDesign.components.map((component) => this._convertComponent(component))
  }

  async convert(): Promise<Manifest['OctopusManifest']> {
    return {
      version: this.manifestVersion,
      origin: { name: 'PHOTOSHOP', version: this.psdVersion },
      name: this.name,
      pages: [],
      components: this._components,
      chunks: [],
      libraries: [],
    }
  }
}
