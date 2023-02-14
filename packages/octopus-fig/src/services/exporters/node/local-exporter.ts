import os from 'os'
import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async'
import kebabCase from 'lodash/kebabCase'
import { v4 as uuidv4 } from 'uuid'

import { MANIFEST_NAME } from '../../../utils/const'
import { makeDir, saveFile } from '../../../utils/files'
import { stringify } from '../../../utils/misc'

import type { Manifest } from '../../../typings/manifest'
import type { RawDesign, RawLayerContainer } from '../../../typings/raw'
import type { ComponentConversionResult } from '../../conversion/design-converter'
import type { AbstractExporter } from '../abstract-exporter'
import type { ResolvedStyle } from '@opendesign/figma-parser/lib/src/index-node'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async'

type LocalExporterOptions = {
  /** Path to directory, where results will be exported. If not provided will use `os.tmpdir()`. */
  path?: string

  /** Path to directory, where previews will be exported. If not provided will use `LocalExporterOptions.path`. */
  previewPath?: string
}

export const IMAGES_DIR_NAME = 'images'
export const IMAGE_EXTNAME = '.png'

export function getOctopusFileName(id: string): string {
  return `octopus-${kebabCase(id)}.json`
}

export function getPreviewFileName(id: string): string {
  return `preview-${kebabCase(id)}${IMAGE_EXTNAME}`
}

export function getSourceFileName(id: string): string {
  return `source-${kebabCase(id)}.json`
}

/**
 * Exporter created to be used in automated runs.
 */
export class LocalExporter implements AbstractExporter {
  private _outputDir: Promise<string>
  private _outputPreviewDir: Promise<string>
  private _assetsSaves: Promise<unknown>[]
  private _completed: DetachedPromiseControls<void>

  static IMAGES_DIR_NAME = IMAGES_DIR_NAME
  static MANIFEST_NAME = MANIFEST_NAME
  static getSourceFileName = getSourceFileName
  static getOctopusFileName = getOctopusFileName
  static getPreviewFileName = getPreviewFileName

  /**
   * Exports octopus assets into given or system TempDir
   * @constructor
   * @param {DebugExporterOptions} [options]
   */
  constructor(options: LocalExporterOptions) {
    this._outputDir = this._initTempDir(options)
    this._outputPreviewDir = this._initPreviewTempDir(options)
    this._assetsSaves = []
    this._completed = detachPromiseControls<void>()
  }

  private async _initTempDir(options: LocalExporterOptions) {
    const tempFallback = path.join(os.tmpdir(), uuidv4())
    const dir = typeof options.path === 'string' ? options.path : tempFallback
    await makeDir(path.join(dir, LocalExporter.IMAGES_DIR_NAME))
    return dir
  }

  private async _initPreviewTempDir(options: LocalExporterOptions) {
    if (typeof options.previewPath !== 'string') return this._outputDir
    const dir = options.previewPath
    await makeDir(dir)
    return dir
  }

  private async _save(path: string, body: string | Buffer) {
    const writePromise = saveFile(path, body)
    this._assetsSaves.push(writePromise)
    await writePromise
    return path
  }

  async completed(): Promise<void> {
    await this._completed.promise
    await Promise.all(this._assetsSaves)
  }

  finalizeExport(): void {
    this._completed.resolve()
  }

  /**
   * Exports given design raw data.
   * @param {RawDesign} raw Design raw data
   * @returns {Promise<string>} returns path to the exported RawDesign
   */
  async exportRawDesign(raw: RawDesign): Promise<string> {
    const fileName = LocalExporter.getSourceFileName('design')
    const fullPath = path.join(await this._outputDir, fileName)
    await this._save(fullPath, stringify(raw))
    return fileName
  }

  /**
   * Exports raw data of given Component.
   * @param {RawLayerContainer} raw Component raw data
   * @param {string} name Name of given Component
   * @returns {Promise<string>} returns path to the exported RawComponent
   */
  async exportRawComponent(raw: RawLayerContainer, name: string): Promise<string> {
    const fileName = LocalExporter.getSourceFileName(name)
    const fullPath = path.join(await this._outputDir, fileName)
    await this._save(fullPath, stringify(raw))
    return fileName
  }

  /**
   * Exports raw data of given chunk.
   * @param {ResolvedStyle} raw Chunk raw data
   * @param {string} name Name of given Chunk
   * @returns {Promise<string>} returns path to the exported RawChunk
   */
  async exportRawChunk(raw: ResolvedStyle, name: string): Promise<string> {
    const fileName = LocalExporter.getSourceFileName(name)
    const fullPath = path.join(await this._outputDir, fileName)
    await this._save(fullPath, stringify(raw))
    return fileName
  }

  /**
   * Exports given OctopusComponent
   * @param {ComponentConversionResult} result contains converted OctopusComponent or Error if conversion failed
   * @returns {Promise<string | null>} returns path to the exported OctopusComponent or `null` if conversion failed
   */
  async exportComponent(result: ComponentConversionResult): Promise<string | null> {
    if (!result.value) return null
    const fileName = LocalExporter.getOctopusFileName(result.id)
    const fullPath = path.join(await this._outputDir, fileName)
    await this._save(fullPath, stringify(result.value))
    return fileName
  }

  getImagePath(name: string): string {
    return path.join(LocalExporter.IMAGES_DIR_NAME, `${name}${IMAGE_EXTNAME}`)
  }

  /**
   * Exports given Image into folder specified in `LocalExporter.IMAGES_DIR_NAME`
   * @param {string} name Name of the exported Image
   * @param {ArrayBuffer} data Image data represented as buffer of binary data
   * @returns {Promise<string>} returns path to the exported Image
   */
  async exportImage(name: string, data: ArrayBuffer): Promise<string> {
    const filePath = this.getImagePath(name)
    const fullPath = path.join(await this._outputDir, filePath)
    await this._save(fullPath, Buffer.from(data))
    return filePath
  }

  /**
   * Exports given Image Preview into folder specified in `LocalExporter.getPreviewFileName()`
   * @param {string} id ID of the exported Image
   * @param {ArrayBuffer} data Image data represented as buffer of binary data
   * @returns {Promise<string>} returns path to the exported Image Preview
   */
  async exportPreview(id: string, data: ArrayBuffer): Promise<string> {
    const fileName = LocalExporter.getPreviewFileName(id)
    const fullPath = path.join(await this._outputPreviewDir, fileName)
    await this._save(fullPath, Buffer.from(data))
    return fileName
  }

  /**
   * Exports given converted OctopusManifest.
   * @param {Manifest['OctopusManifest']} manifest Given converted OctopusManifest data object.
   * @returns {Promise<string>} returns path to the OctopusManifest
   */
  async exportManifest(manifest: Manifest['OctopusManifest']): Promise<string> {
    const fullPath = path.join(await this._outputDir, LocalExporter.MANIFEST_NAME)
    return this._save(fullPath, stringify(manifest))
  }
}
