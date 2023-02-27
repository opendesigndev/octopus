import os from 'os'
import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'
import kebabCase from 'lodash/kebabCase.js'
import { v4 as uuidv4 } from 'uuid'

import { MANIFEST_NAME } from '../../../utils/const.js'
import { makeDir, saveFile } from '../../../utils/files.js'
import { stringify } from '../../../utils/misc.js'

import type { Manifest } from '../../../typings/manifest.js'
import type { RawDesign, RawLayerContainer } from '../../../typings/raw/index.js'
import type { ComponentConversionResult } from '../../conversion/design-converter.js'
import type { AbstractExporter } from '../abstract-exporter.js'
import type { ResolvedStyle } from '@opendesign/figma-parser'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'

type LocalExporterOptions = {
  /** Path to directory, where results will be exported. If not provided will use `os.tmpdir()`. */
  path: string
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
    this._assetsSaves = []
    this._completed = detachPromiseControls<void>()
  }

  private async _initTempDir(options: LocalExporterOptions) {
    const tempFallback = path.join(os.tmpdir(), uuidv4())
    const dir = typeof options.path === 'string' ? options.path : tempFallback
    await makeDir(path.join(dir, LocalExporter.IMAGES_DIR_NAME))
    return dir
  }

  private async _save(name: string | null, body: string | Buffer) {
    const dir = await this._outputDir
    const fullPath = path.join(dir, typeof name === 'string' ? name : uuidv4())
    const write = saveFile(fullPath, body)
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

  /**
   * Exports given design raw data.
   * @param {RawDesign} raw Design raw data
   * @returns {Promise<string>} returns path to the exported RawDesign
   */
  async exportRawDesign(raw: RawDesign): Promise<string> {
    const rawPath = LocalExporter.getSourceFileName('design')
    await this._save(rawPath, stringify(raw))
    return rawPath
  }

  /**
   * Exports raw data of given Component.
   * @param {RawLayerContainer} raw Component raw data
   * @param {string} name Name of given Component
   * @returns {Promise<string>} returns path to the exported RawComponent
   */
  async exportRawComponent(raw: RawLayerContainer, name: string): Promise<string> {
    const rawPath = LocalExporter.getSourceFileName(name)
    await this._save(rawPath, stringify(raw))
    return rawPath
  }

  /**
   * Exports raw data of given chunk.
   * @param {ResolvedStyle} raw Chunk raw data
   * @param {string} name Name of given Chunk
   * @returns {Promise<string>} returns path to the exported RawChunk
   */
  async exportRawChunk(raw: ResolvedStyle, name: string): Promise<string> {
    const rawPath = LocalExporter.getSourceFileName(name)
    await this._save(rawPath, stringify(raw))
    return rawPath
  }

  /**
   * Exports given OctopusComponent
   * @param {ComponentConversionResult} result contains converted OctopusComponent or Error if conversion failed
   * @returns {Promise<string | null>} returns path to the exported OctopusComponent or `null` if conversion failed
   */
  async exportComponent(result: ComponentConversionResult): Promise<string | null> {
    if (!result.value) return null
    const path = LocalExporter.getOctopusFileName(result.id)
    await this._save(path, stringify(result.value))
    return path
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
    const imagePath = this.getImagePath(name)
    await this._save(imagePath, Buffer.from(data))
    return imagePath
  }

  /**
   * Exports given Image Preview into folder specified in `LocalExporter.getPreviewFileName()`
   * @param {string} id ID of the exported Image
   * @param {ArrayBuffer} data Image data represented as buffer of binary data
   * @returns {Promise<string>} returns path to the exported Image Preview
   */
  async exportPreview(id: string, data: ArrayBuffer): Promise<string> {
    const previewPath = LocalExporter.getPreviewFileName(id)
    await this._save(previewPath, Buffer.from(data))
    return previewPath
  }

  /**
   * Exports given converted OctopusManifest.
   * @param {Manifest['OctopusManifest']} manifest Given converted OctopusManifest data object.
   * @returns {Promise<string>} returns path to the OctopusManifest
   */
  async exportManifest(manifest: Manifest['OctopusManifest']): Promise<string> {
    return this._save(LocalExporter.MANIFEST_NAME, stringify(manifest))
  }
}
