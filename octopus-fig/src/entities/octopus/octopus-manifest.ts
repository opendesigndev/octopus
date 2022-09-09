import { getMapped, push } from '@avocode/octopus-common/dist/utils/common'

import { logger } from '../../services'
import { getRole } from '../../utils/source'

import type { OctopusFigConverter } from '../../octopus-fig-converter'
import type { Manifest } from '../../typings/manifest'
import type { SourceArtboard } from '../source/source-artboard'
import type { SourceDesign } from '../source/source-design'
import type { ResolvedStyle } from '@avocode/figma-parser/lib/src/index-node'

type OctopusManifestOptions = {
  sourceDesign: SourceDesign
  octopusConverter: OctopusFigConverter
}

export type ComponentDescriptor = {
  path: unknown
  error: Error | null
  time: number | null
}

type ComponentSourceWithDescriptor = { source: SourceArtboard; descriptor: ComponentDescriptor }

export class OctopusManifest {
  private _sourceDesign: SourceDesign
  private _octopusConverter: OctopusFigConverter
  private _exports: {
    images: Map<string, string | undefined>
    previews: Map<string, string | undefined>
    components: Map<string, ComponentSourceWithDescriptor>
    componentImageMap: Map<string, string[]>
    componentSourcePath: Map<string, string | undefined>
    libraries: Map<string, Manifest['Library']>
    chunks: Map<string, { style: ResolvedStyle; sourcePath?: string } | undefined>
  }

  static DEFAULT_FIG_VERSION = '0'
  static DEFAULT_FIG_FILENAME = 'Untitled'

  static CHUNK_TYPE_MAP = {
    FILL: 'STYLE_FILL',
    TEXT: 'STYLE_TEXT',
    EFFECT: 'STYLE_EFFECT',
    GRID: 'STYLE_GRID',
  } as const

  constructor(options: OctopusManifestOptions) {
    this._sourceDesign = options.sourceDesign
    this._octopusConverter = options.octopusConverter
    this._exports = {
      images: new Map(),
      previews: new Map(),
      components: new Map(),
      componentImageMap: new Map(),
      componentSourcePath: new Map(),
      libraries: new Map(),
      chunks: new Map(),
    }
  }

  setExportedImagePath(name: string, path: string | undefined): void {
    this._exports.images.set(name, path)
  }

  getExportedImagePath(name: string): string | undefined {
    return this._exports.images.get(name)
  }

  setExportedPreviewPath(id: string, path: string | undefined): void {
    this._exports.images.set(id, path)
  }

  getExportedPreviewPath(id: string): string | undefined {
    return this._exports.images.get(id)
  }

  setExportedComponentImageMap(componentId: string, imageIds: string[]): void {
    this._exports.componentImageMap.set(componentId, imageIds)
  }

  getExportedComponentImageMap(componentId: string): string[] | undefined {
    return this._exports.componentImageMap.get(componentId)
  }

  setExportedSourcePath(componentId: string, sourcePath?: string): void {
    this._exports.componentSourcePath.set(componentId, sourcePath)
  }

  getExportedSourcePath(componentId: string): string | undefined {
    return this._exports.componentSourcePath.get(componentId)
  }

  setExportedChunk(style: ResolvedStyle, sourcePath?: string): void {
    this._exports.chunks.set(style.id, { style, sourcePath })
  }

  getExportedChunk(chunkId: string): { style: ResolvedStyle; sourcePath?: string } | undefined {
    return this._exports.chunks.get(chunkId)
  }

  setExportedLibrary(id: string, name: string, childId: string, description?: string): void {
    const library = this._exports.libraries.get(id)
    if (!library) {
      this._exports.libraries.set(id, { id, name, description, children: [{ id: childId, type: 'COMPONENT' }] })
    } else {
      library.children = push(library.children, { id: childId, type: 'COMPONENT' })
    }
  }

  getExportedComponentDescriptorById(id: string): ComponentDescriptor | undefined {
    return this._exports.components.get(id)?.descriptor
  }

  getExportedComponentPathById(id: string): string | undefined {
    const componentResult = this._exports.components.get(id)
    if (typeof componentResult?.descriptor?.path !== 'string') return undefined
    return componentResult.descriptor.path
  }

  setExportedComponent(source: SourceArtboard, descriptor: ComponentDescriptor): void {
    this._exports.components.set(source.id, { source, descriptor })
  }

  get manifestVersion(): string {
    return this._octopusConverter.pkg.version
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
    const status = this.getExportedComponentDescriptorById(source.id)
    const statusValue = status ? (status.error ? 'FAILED' : 'READY') : 'PROCESSING'
    return {
      value: statusValue,
      error: this._convertError(status?.error),
      time: status?.time ?? undefined,
    }
  }

  private _getAssetImage(imageName: string): Manifest['AssetImage'] | null {
    const path = this.getExportedImagePath(imageName) ?? ''
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
    const imageIds = this.getExportedComponentImageMap(source.id) ?? []
    const images = this._getAssetImages(imageIds)
    const fonts = this._getAssetFonts(source.dependencies.fonts)
    return { images, fonts }
  }

  private _getSourceArtifact(path: string): Manifest['Artifact'] {
    return { type: 'SOURCE', location: { type: 'RELATIVE', path } }
  }

  private _getArtifacts(source: SourceArtboard): Manifest['Artifact'][] {
    const artifacts: Manifest['Artifact'][] = []
    const sourcePath = this.getExportedSourcePath(source.id)
    if (sourcePath) artifacts.push(this._getSourceArtifact(sourcePath))
    return artifacts
  }

  private _getPreview(id: string): Manifest['ResourceLocation'] | undefined {
    const previewPath = this.getExportedPreviewPath(id)
    if (!previewPath) return
    return { type: 'RELATIVE', path: previewPath }
  }

  private _getVariantProperties(name = ''): Manifest['VariantMeta']['properties'] {
    const properties: Manifest['VariantMeta']['properties'] = {}
    name.split(', ').forEach((part) => {
      const property = part.split('=')
      if (property.length !== 2) return
      const [key, value] = property
      properties[key] = value
    })
    return properties
  }

  private _getVariant(id: string): Manifest['VariantMeta'] | undefined {
    const component = this._sourceDesign.components[id]
    if (!component) return undefined
    const { componentSetId: setId, description } = component
    if (!setId) return undefined
    const componentSet = this._sourceDesign.componentSets[setId]
    if (!componentSet) return undefined
    const { name: setName, description: setDescription } = componentSet
    if (!setName) return undefined
    const of = { id: setId, name: setName, description: setDescription }
    const properties = this._getVariantProperties(component.name)
    return { of, properties, description }
  }

  private _getChunk(style?: ResolvedStyle, sourcePath?: string): Manifest['Chunk'] | undefined {
    if (!style || !sourcePath) return undefined
    const { id, meta } = style
    const { name, description, styleType } = meta
    const type = getMapped(styleType, OctopusManifest.CHUNK_TYPE_MAP, undefined)
    if (!type) {
      logger?.warn('Unknown chunk type', { styleType })
      return undefined
    }
    const location = { type: 'RELATIVE', path: sourcePath } as const
    return { id, name, description, type, location }
  }

  get chunks(): Manifest['Chunk'][] {
    return Array.from(this._exports.chunks.values())
      .map((chunk) => this._getChunk(chunk?.style, chunk?.sourcePath))
      .filter((chunk): chunk is Manifest['Chunk'] => Boolean(chunk))
  }

  get libraries(): Manifest['Library'][] {
    return Array.from(this._exports.libraries.values())
  }

  private _getArtboard(source: SourceArtboard): Manifest['Component'] {
    const id = source.id
    const bounds = source.bounds ?? undefined
    const status = this._getStatus(source)

    const path = this.getExportedComponentPathById(id) ?? ''
    const location: Manifest['ResourceLocation'] = { type: 'RELATIVE', path }
    const assets = this._getAssets(source)
    const artifacts = this._getArtifacts(source)
    const role = getRole(source)
    const preview = this._getPreview(id)
    const variant = this._getVariant(id)

    return {
      id,
      name: source.name,
      role,
      status,
      bounds,
      dependencies: [],
      preview,
      assets,
      artifacts,
      variant,
      location,
    }
  }

  get components(): Manifest['Component'][] {
    return Array.from(this._exports.components.values()).map((component) => this._getArtboard(component.source))
  }

  async convert(): Promise<Manifest['OctopusManifest']> {
    return {
      version: this.manifestVersion,
      origin: {
        name: 'FIGMA',
        version: this.figVersion,
      },
      name: this.name,
      pages: this.pages,
      components: this.components,
      chunks: this.chunks,
      libraries: this.libraries,
    }
  }
}
