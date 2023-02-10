import { detachPromiseControls } from '@opendesign/octopus-common/utils/async'
import { compareStrings, getMapped, push } from '@opendesign/octopus-common/utils/common'

import { logger } from '../../services'
import { convertId } from '../../utils/convert'
import { getRole } from '../../utils/source'

import type { OctopusFigConverter } from '../../octopus-fig-converter'
import type { Manifest } from '../../typings/manifest'
import type { SourceComponent } from '../source/source-component'
import type { SourceDesign } from '../source/source-design'
import type { ResolvedStyle } from '@opendesign/figma-parser'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/utils/async'

type OctopusManifestOptions = {
  sourceDesign: SourceDesign
  octopusConverter: OctopusFigConverter
}

export type ComponentDescriptor = {
  path: unknown
  error: Error | null
  time: number | null
}

export type SetExportedLibraryOptions = {
  name: string
  designId: string
  description: string
  designNodeId: string
}

type ComponentSourceWithDescriptor = { source: SourceComponent; descriptor: ComponentDescriptor }

export class OctopusManifest {
  private _sourceDesign: SourceDesign
  private _octopusConverter: OctopusFigConverter
  private _exports: {
    images: Map<string, DetachedPromiseControls<string> | undefined>
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

  finalize() {
    const imageNames: string[] = [...this._exports.images.keys()] // let's finish all the pending stuff with rejection
    imageNames.forEach((name) => {
      this._exports.images.get(name)?.reject(new Error(`Image with name '${name}' is missing`))
    })
  }

  async setExportedImagePath(name: string, pathPromise?: Promise<string>): Promise<void> {
    if (!this._exports.images.has(name)) {
      this._exports.images.set(name, detachPromiseControls<string>())
    }
    this._exports.images.get(name)?.resolve(pathPromise)
  }

  getExportedImagePath(name: string): Promise<string | undefined> | undefined {
    if (!this._exports.images.has(name)) {
      this._exports.images.set(name, detachPromiseControls<string>())
    }
    return this._exports.images.get(name)?.promise
  }

  setExportedPreviewPath(componentId: string, path: string | undefined): void {
    this._exports.previews.set(componentId, path)
  }

  getExportedPreviewPath(componentId: string): string | undefined {
    return this._exports.previews.get(componentId)
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

  setExportedLibrary(options: SetExportedLibraryOptions): void {
    const { designId, name, designNodeId } = options
    const id = convertId(designId)
    const child = { id: convertId(designNodeId), type: 'COMPONENT' as const }
    const library = this._exports.libraries.get(designId)
    if (!library) {
      const meta = { originalId: designId }
      this._exports.libraries.set(designId, { id, name, meta, children: [child] })
    } else {
      library.children = push(library.children, child)
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

  setExportedComponent(source: SourceComponent, descriptor: ComponentDescriptor): void {
    this._exports.components.set(source.id, { source, descriptor })
  }

  get manifestVersion(): string {
    return this._octopusConverter.pkg.manifestSpecVersion
  }

  get meta(): Manifest['OctopusManifestMeta'] {
    const converterVersion = this._octopusConverter.pkg.version
    return { converterVersion }
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
    const converted: Manifest['Page'][] = this._sourceDesign.pages.map((page) => ({
      id: convertId(page.id),
      name: page.name,
      meta: { originalId: page.id },
      children: page.children.map((elem) => ({ id: convertId(elem.id), type: 'COMPONENT' })),
    }))
    return [...converted].sort((a, b) => compareStrings(a.id, b.id))
  }

  private _getStatus(source: SourceComponent): Manifest['Status'] {
    const id = source.id
    const status = this.getExportedComponentDescriptorById(id)
    const statusValue = status ? (status.error ? 'FAILED' : 'READY') : 'PROCESSING'
    return {
      value: statusValue,
      error: this._convertError(status?.error),
      time: status?.time ?? undefined,
    }
  }

  private async _getAssetImage(imageName: string): Promise<Manifest['AssetImage'] | null> {
    const path = (await this.getExportedImagePath(imageName)) ?? ''
    const location = { type: 'RELATIVE' as const, path }
    return { location, refId: imageName }
  }

  private async _getAssetImages(imageNames: string[]): Promise<Manifest['AssetImage'][]> {
    const assetImages: Manifest['AssetImage'][] = []
    for (const imageName of imageNames) {
      const assetImage = await this._getAssetImage(imageName)
      if (assetImage) assetImages.push(assetImage)
    }
    return assetImages
  }

  private _getAssetFonts(fonts: string[]): Manifest['AssetFont'][] {
    return fonts.map((font) => ({ name: font }))
  }

  private async _getAssets(source: SourceComponent): Promise<Manifest['Assets']> {
    const imageIds = this.getExportedComponentImageMap(source.id) ?? []
    const images = await this._getAssetImages(imageIds)
    const fonts = this._getAssetFonts(source.dependencies.fonts)
    return { images, fonts }
  }

  private _getSourceArtifact(path: string): Manifest['Artifact'] {
    return { type: 'SOURCE', location: { type: 'RELATIVE', path } }
  }

  private _getArtifacts(source: SourceComponent): Manifest['Artifact'][] {
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
    const component = this._sourceDesign.getComponentById(id)
    if (!component) return undefined
    const { componentSetId: setId, description } = component
    if (!setId) return undefined
    const componentSet = this._sourceDesign.componentSets[setId]
    if (!componentSet) return undefined
    const { name: setName, description: setDescription } = componentSet
    if (!setName) return undefined
    const of = { id: convertId(setId), name: setName, meta: { originalId: setId }, description: setDescription }
    const properties = this._getVariantProperties(component.name)
    return { of, properties, description }
  }

  private _getChunk(style?: ResolvedStyle, sourcePath?: string): Manifest['Chunk'] | undefined {
    if (!style || !sourcePath) return undefined
    const id = convertId(style.id)
    const { name, description, styleType } = style.meta
    const type = getMapped(styleType, OctopusManifest.CHUNK_TYPE_MAP, undefined)
    if (!type) {
      logger?.warn('Unknown chunk type', { styleType })
      return undefined
    }
    const location = { type: 'RELATIVE', path: sourcePath } as const
    const meta = { originalId: style.id }
    return { id, name, meta, description, type, location }
  }

  get chunks(): Manifest['Chunk'][] {
    return Array.from(this._exports.chunks.values())
      .map((chunk) => this._getChunk(chunk?.style, chunk?.sourcePath))
      .filter((chunk): chunk is Manifest['Chunk'] => Boolean(chunk))
  }

  get libraries(): Manifest['Library'][] {
    return Array.from(this._exports.libraries.values())
  }

  private async _getComponent(source: SourceComponent): Promise<Manifest['Component']> {
    const id = convertId(source.id)
    const bounds = source.bounds ?? undefined
    const status = this._getStatus(source)

    const path = this.getExportedComponentPathById(source.id) ?? ''
    const location: Manifest['ResourceLocation'] = { type: 'RELATIVE', path }
    const assets = await this._getAssets(source)
    const artifacts = this._getArtifacts(source)
    const role = getRole(source)
    const preview = this._getPreview(source.id)
    const variant = this._getVariant(source.id)
    const meta = { originalId: source.id }

    return {
      id,
      name: source.name,
      role,
      meta,
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

  async components(): Promise<Manifest['Component'][]> {
    const componentSources = Array.from(this._exports.components.values())
    const converted = await Promise.all(componentSources.map((component) => this._getComponent(component.source)))
    return [...converted].sort((a, b) => compareStrings(a.id, b.id))
  }

  async convert(): Promise<Manifest['OctopusManifest']> {
    return {
      version: this.manifestVersion,
      origin: {
        name: 'FIGMA',
        version: this.figVersion,
      },
      name: this.name,
      meta: this.meta,
      pages: this.pages,
      components: await this.components(),
      chunks: this.chunks,
      libraries: this.libraries,
    }
  }
}
