import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { promises as fsp } from 'fs'
import EventEmitter from 'events'
import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'

import type { Exporter } from '.'
import type { ArtboardConversionResult, DesignConversionResult } from '../../..'
import type SourceDesign from '../../../entities/source/source-design'
import type SourceArtboard from '../../../entities/source/source-artboard'
import type { DetachedPromiseControls } from '@avocode/octopus-common/dist/utils/async'

type TempExporterOptions = {
  id?: string
  tempDir: string
}

type SourceResources = { metadata: string; images: string[]; ocProperties: string }

export class TempExporter extends EventEmitter implements Exporter {
  private _outputDir: Promise<string>
  private _tempDir: string
  private _completed: DetachedPromiseControls<void>
  private _assetsSaves: Promise<unknown>[]

  static IMAGES_DIR_NAME = 'images'
  static OCTOPUS_MANIFEST_NAME = 'octopus-manifest.json'
  static METADATA_NAME = 'resources.json'
  static OC_PROPERTIES_NAME = 'ocProperties.json'
  static ADDITIONAL_TEXT_DATA = 'additionalTextData.json'

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

    return path.resolve('./' + fullPath)
  }

  getBasePath(): Promise<string> {
    return this._outputDir
  }

  async exportSourceDesign(design: SourceDesign): Promise<SourceResources> {
    const saveMetadata = this._save(TempExporter.METADATA_NAME, this._stringify(design.metadaData.raw))
    const saveOcProperties = this._save(TempExporter.OC_PROPERTIES_NAME, this._stringify(design.ocProperties))
    const saveAdditionalTextData = design.additionalTextData
      ? this._save(TempExporter.ADDITIONAL_TEXT_DATA, this._stringify(design.additionalTextData))
      : null

    /**
     * It's possible (and more idiomatic) to save images via `exportImage()`, but for debugging purposes we
     * do it all in once via SourceDesign entity.
     */
    const saveImages = Promise.all(
      design.images.map((image) => {
        return this._save(path.join(TempExporter.IMAGES_DIR_NAME, image.id), image.rawValue)
      })
    )
    const [metadata, images, ocProperties, additionalTextData] = await Promise.all([
      saveMetadata,
      saveImages,
      saveOcProperties,
      saveAdditionalTextData,
    ])
    const result = { metadata, images, ocProperties, additionalTextData }
    this.emit('source:resources', result)

    return result
  }

  async exportArtboard(source: SourceArtboard, artboard: ArtboardConversionResult): Promise<string> {
    const sourcePath = await this._save(`source-${artboard.id}.json`, this._stringify(source.raw))
    const octopusPath = await this._save(`octopus-${artboard.id}.json`, this._stringify(artboard.value))
    const result = {
      id: artboard.id,
      name: source.name,
      time: artboard.time,
      error: artboard.error,
      octopusPath,
      sourcePath,
    }
    this.emit('octopus:artboard', result)
    return octopusPath
  }

  async exportImage(name: string, data: Buffer): Promise<string> {
    return this._save(path.join(TempExporter.IMAGES_DIR_NAME, path.basename(name)), data)
  }

  async exportManifest(designConversionResult: DesignConversionResult): Promise<string> {
    const manifestPath = await this._save(
      TempExporter.OCTOPUS_MANIFEST_NAME,
      this._stringify(designConversionResult.manifest)
    )

    this._completed.resolve()
    this.emit('octopus:manifest', manifestPath)
    return manifestPath
  }
}
