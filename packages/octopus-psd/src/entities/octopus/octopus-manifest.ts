import path from 'path'

import { asArray, asString } from '@opendesign/octopus-common/dist/utils/as.js'

import { getFontProperties } from '../../utils/text.js'

import type { OctopusPSDConverter } from '../../octopus-psd-converter'
import type { Manifest } from '../../typings/manifest'
import type { RawEngineData, RawNodeChildWithProps, RawParsedPsd } from '../../typings/raw'
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

  get version(): string {
    return this._octopusConverter.pkg.manifestSpecVersion
  }

  get meta(): Manifest['OctopusManifestMeta'] {
    const photoshopICCProfile = this._sourceDesign.iccProfileName
    const converterVersion = this._octopusConverter.pkg.version
    // by default typescript does not check for excess types
    // https://github.com/microsoft/TypeScript/issues/19775#issue-271567665
    return { converterVersion, ...(photoshopICCProfile ? { photoshopICCProfile } : null) }
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

  private _getFontNames(engineData: RawEngineData | undefined): string[] {
    const { ResourceDict } = engineData ?? {}
    const { FontSet } = ResourceDict ?? {}
    const { RunArray } = engineData?.EngineDict?.StyleRun ?? {}
    const fontSet = asArray(FontSet)
    const runArray = asArray(RunArray)

    return runArray
      .map(({ StyleSheet }) => {
        return getFontProperties(fontSet, StyleSheet?.StyleSheetData).fontPostScriptName
      })
      .filter((fontName): fontName is string => typeof fontName === 'string')
  }

  private _getComponentAssetsFonts(
    raw: RawParsedPsd | RawNodeChildWithProps,
    fontsSet: Set<string> = new Set()
  ): Set<string> {
    if ('textProperties' in raw) {
      const fonts = this._getFontNames(raw.textProperties)
      fonts.forEach((fontName) => fontsSet.add(fontName))
    }

    if ('children' in raw) {
      raw.children?.forEach((child) => this._getComponentAssetsFonts(child, fontsSet))
    }

    return fontsSet
  }

  private _getComponentAssets(targetComponent: SourceComponent): Manifest['Assets'] | null {
    const raw = targetComponent?.raw
    if (!raw) return null

    const images: Manifest['AssetImage'][] = this._sourceDesign.images.map((image) => {
      const path = this.getExportedRelativeImageByName(image.name) ?? ''
      const location: Manifest['ResourceLocation'] = { type: 'RELATIVE', path }
      return { location, refId: image.name }
    })

    const fonts: Manifest['AssetFont'][] = Array.from(this._getComponentAssetsFonts(raw as RawParsedPsd)).map(
      (font) => ({
        name: font,
      })
    )

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
      version: this.version,
      origin: { name: 'PHOTOSHOP', version: this.psdVersion },
      name: this.name,
      meta: this.meta,
      pages: [],
      components: this._components,
      chunks: [],
      libraries: [],
    }
  }
}
