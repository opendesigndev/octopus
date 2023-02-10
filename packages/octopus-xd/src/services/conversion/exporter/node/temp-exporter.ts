import EventEmitter from 'events'
import { promises as fsp } from 'fs'
import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/utils/async'
import { v4 as uuidv4 } from 'uuid'

import type { Exporter } from '../'
import type { SourceArtboard } from '../../../../entities/source/source-artboard'
import type { SourceDesign } from '../../../../entities/source/source-design'
import type { ArtboardConversionResult, DesignConversionResult } from '../../../../octopus-xd-converter'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/utils/async'

type TempExporterOptions = {
  id?: string
  tempDir: string
}

type SourceResources = { manifest: string; interactions: string; resources: string }

export class TempExporter extends EventEmitter implements Exporter {
  private _outputDir: Promise<string>
  private _tempDir: string
  private _assetsSaves: Promise<unknown>[]
  private _completed: DetachedPromiseControls<void>

  static IMAGES_DIR_NAME = 'images'
  static OCTOPUS_MANIFEST_NAME = 'octopus-manifest.json'
  static MANIFEST_NAME = 'manifest.json'
  static INTERACTIONS_NAME = 'interactions.json'
  static RESOURCES_NAME = 'resources.json'

  constructor(options: TempExporterOptions) {
    super()
    this._tempDir = options.tempDir
    this._outputDir = this._initOutputDir(options)
    this._assetsSaves = []
    this._completed = detachPromiseControls<void>()
  }

  private _stringify(value: unknown) {
    return JSON.stringify(value, null, '  ')
  }

  private async _initOutputDir(options: TempExporterOptions) {
    const tempDir = path.join(this._tempDir, typeof options.id === 'string' ? options.id : uuidv4())
    await fsp.mkdir(path.join(tempDir, TempExporter.IMAGES_DIR_NAME), { recursive: true })
    return tempDir
  }

  private async _save(name: string | null, body: string | Buffer) {
    const dir = await this._outputDir
    const fullPath = path.join(dir, typeof name === 'string' ? name : uuidv4())
    const write = fsp.writeFile(fullPath, body)
    this._assetsSaves.push(write)
    await write
    return fullPath
  }

  async completed(): Promise<void> {
    await this._completed.promise
    await Promise.all(this._assetsSaves)
  }

  finalizeExport(): void {
    this._completed.resolve()
  }

  getBasePath(): Promise<string> {
    return this._outputDir
  }

  async exportSourceDesign(design: SourceDesign): Promise<SourceResources> {
    const saveManifest = this._save(TempExporter.MANIFEST_NAME, this._stringify(design.manifest.raw))
    const saveInteractions = this._save(TempExporter.INTERACTIONS_NAME, this._stringify(design.interactions.raw))
    const saveResources = this._save(TempExporter.RESOURCES_NAME, this._stringify(design.resources.raw))
    /**
     * It's possible (and more idiomatic) to save images via `exportImage()`, but for debugging purposes we
     * do it all in once via SourceDesign entity.
     */
    const saveImages = Promise.all(
      design.images.map(async (image) => {
        const rawData = await image.getImageData()
        return this._save(path.join(TempExporter.IMAGES_DIR_NAME, path.basename(image.path)), Buffer.from(rawData))
      })
    )
    const [manifest, interactions, resources, images] = await Promise.all([
      saveManifest,
      saveInteractions,
      saveResources,
      saveImages,
    ])
    const result = { manifest, interactions, resources, images }
    this.emit('source:resources', result)
    return result
  }

  async exportArtboard(source: SourceArtboard, artboard: ArtboardConversionResult): Promise<string> {
    const sourcePath = await this._save(`source-${artboard.id}.json`, this._stringify(source.raw))
    const octopusPath = await this._save(`octopus-${artboard.id}.json`, this._stringify(artboard.value))
    const result = {
      id: artboard.id,
      name: source.meta.name,
      time: artboard.time,
      error: artboard.error,
      octopusPath,
      sourcePath,
    }
    this.emit('octopus:artboard', result)
    return octopusPath
  }

  async exportImage(name: string, data: Uint8Array): Promise<string> {
    return this._save(path.join(TempExporter.IMAGES_DIR_NAME, path.basename(name)), Buffer.from(data))
  }

  async exportManifest(manifest: DesignConversionResult): Promise<string> {
    const manifestPath = await this._save(TempExporter.OCTOPUS_MANIFEST_NAME, this._stringify(manifest.manifest))
    this.emit('octopus:manifest', manifestPath)
    return manifestPath
  }
}
