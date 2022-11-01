import { promises as fsp } from 'fs'
import os from 'os'
import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async'
import { v4 as uuidv4 } from 'uuid'

import { createOctopusArtboardFileName } from '../../../utils/exporter'

import type { Exporter, AuxiliaryData } from '.'
import type { SourceArtboard } from '../../../entities/source/source-artboard'
import type { SourceDesign } from '../../../entities/source/source-design'
import type { ArtboardConversionResult, DesignConversionResult } from '../design-converter'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async'

type LocalExporterOptions = {
  path?: string
}

/**
 * Exporter created to be used in automated runs.
 */
export class LocalExporter implements Exporter {
  private _outputDir: Promise<string>
  private _assetsSaves: Promise<unknown>[]
  private _completed: DetachedPromiseControls<void>

  static IMAGES_DIR_NAME = 'images'
  static OCTOPUS_MANIFEST_NAME = 'octopus-manifest.json'
  static METADATA_NAME = 'metadata.json'
  static ADDITIONAL_TEXT_DATA = 'additional-text-data.json'

  /**
   * Exports octopus assets into provided or system created directory
   * @constructor
   * @param {LocalExporterOptions} [options]
   */
  constructor(options: LocalExporterOptions) {
    this._outputDir = this._initTempDir(options)
    this._assetsSaves = []
    this._completed = detachPromiseControls<void>()
  }

  private _stringify(value: unknown) {
    return JSON.stringify(value, null, '  ')
  }

  private async _initTempDir(options: LocalExporterOptions) {
    const tempFallback = path.join(os.tmpdir(), uuidv4())
    const dir = typeof options.path === 'string' ? options.path : tempFallback
    await fsp.mkdir(path.join(dir, LocalExporter.IMAGES_DIR_NAME), { recursive: true })
    return dir
  }

  private async _save(name: string | null, body: string | Buffer) {
    const dir = await this._outputDir
    const fullPath = path.join(dir, typeof name === 'string' ? name : uuidv4())
    const save = fsp.writeFile(fullPath, body)
    this._assetsSaves.push(save)
    await save

    return fullPath
  }

  getBasePath(): Promise<string> {
    return this._outputDir
  }

  /**
   * Exports metadata and additional text data
   * @param {SourceDesign} instance of SourceDesign is container for preprocessed input data, such as artboards,
   * metadata, images, etc.
   * @returns {Promise<AuxiliaryData>} (metadata and additional text data)
   */
  async exportAuxiliaryData(design: SourceDesign): Promise<AuxiliaryData> {
    const saveMetadata = this._save(LocalExporter.METADATA_NAME, this._stringify(design.metadaData))
    const saveAdditionalTextData = design.additionalTextData
      ? this._save(LocalExporter.ADDITIONAL_TEXT_DATA, this._stringify(design.additionalTextData))
      : null

    const [metadata, additionalTextData] = await Promise.all([saveMetadata, saveAdditionalTextData])

    const result = { metadata, additionalTextData }

    return result
  }

  async completed(): Promise<void> {
    await this._completed.promise
    await Promise.all(this._assetsSaves)
  }

  /**
   * Exports given Octopus Artboard
   * @param {ArtboardConversionResult} artboard contains converted OctopuosArtboard or Error if conversion failed
   * @returns {Promise<string | null>} returns path to the exported OctopusArtboard
   */
  exportArtboard(_: SourceArtboard, artboard: ArtboardConversionResult): Promise<string | null> {
    if (!artboard.value) return Promise.resolve(null)
    return this._save(createOctopusArtboardFileName(artboard.value?.id ?? ''), this._stringify(artboard.value))
  }

  /**
   * Exports given Image into folder specified in `LocalExporter.IMAGES_DIR_NAME`
   * @param {string} name Name of the exported Image
   * @param {Buffer} data Data representation of given image
   * @returns {Promise<string>} which designates path to the exported Image
   */
  exportImage(name: string, data: Buffer): Promise<string> {
    return this._save(path.join(LocalExporter.IMAGES_DIR_NAME, path.basename(name)), data)
  }

  finalizeExport(): void {
    this._completed.resolve()
  }

  /**
   * Exports given converted OctopusManifest.
   * @param {DesignConversionResult} result contains converted OctopusManifest + conversion Time
   * @returns {Promise<string>} returns path to the OctopusManifest
   */
  async exportManifest({ manifest }: DesignConversionResult): Promise<string> {
    return this._save(LocalExporter.OCTOPUS_MANIFEST_NAME, this._stringify(manifest))
  }
}
