import EventEmitter from 'events'
import { promises as fsp } from 'fs'
import path from 'path'

import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import { v4 as uuidv4 } from 'uuid'

import { createOctopusArtboardFileName } from '../../../utils/exporter'

import type { Exporter, AuxiliaryData } from '.'
import type { SourceArtboard } from '../../../entities/source/source-artboard'
import type { SourceDesign } from '../../../entities/source/source-design'
import type { ArtboardConversionResult, DesignConversionResult } from '../design-converter'
import type { DetachedPromiseControls } from '@avocode/octopus-common/dist/utils/async'

type TempExporterOptions = {
  id?: string
  tempDir: string
}

export class TempExporter extends EventEmitter implements Exporter {
  private _outputDir: Promise<string>
  private _tempDir: string
  private _completed: DetachedPromiseControls<void>
  private _assetsSaves: Promise<unknown>[]

  static IMAGES_DIR_NAME = 'images'
  static OCTOPUS_MANIFEST_NAME = 'octopus-manifest.json'
  static METADATA_NAME = 'metadata.json'
  static ADDITIONAL_TEXT_DATA = 'additional-text-data.json'

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

  getBasePath(): Promise<string> {
    return this._outputDir
  }

  async exportAuxiliaryData(design: SourceDesign): Promise<AuxiliaryData> {
    const saveMetadata = this._save(TempExporter.METADATA_NAME, this._stringify(design.metadaData))
    const saveAdditionalTextData = design.additionalTextData
      ? this._save(TempExporter.ADDITIONAL_TEXT_DATA, this._stringify(design.additionalTextData))
      : null

    const saveImages = Promise.all(
      design.images.map(async (image) => {
        const rawValue = await image.getImageData()
        return this._save(path.join(TempExporter.IMAGES_DIR_NAME, image.id), rawValue)
      })
    )

    const [metadata, images, additionalTextData] = await Promise.all([saveMetadata, saveImages, saveAdditionalTextData])

    const result = { metadata, images, additionalTextData }
    this.emit('source:resources', result)

    return result
  }

  async completed(): Promise<void> {
    await this._completed.promise
    await Promise.all(this._assetsSaves)
  }

  async exportArtboard(source: SourceArtboard, artboard: ArtboardConversionResult): Promise<string> {
    const sourcePath = await this._save(`source-${artboard.id}.json`, this._stringify(source.raw))
    const octopusPath = await this._save(
      createOctopusArtboardFileName(artboard.value?.id ?? ''),
      this._stringify(artboard.value)
    )

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

  finalizeExport(): void {
    this._completed.resolve()
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
