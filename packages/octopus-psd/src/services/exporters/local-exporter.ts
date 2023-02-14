import os from 'os'
import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'
import { v4 as uuidv4 } from 'uuid'

import { getOctopusFileName, IMAGES_DIR_NAME, MANIFEST_NAME } from '../../utils/exporter.js'
import { makeDir, saveFile } from '../../utils/files.js'
import { stringify } from '../../utils/stringify.js'

import type { ComponentConversionResult, DesignConversionResult } from '../conversion/design-converter'
import type { AbstractExporter } from './abstract-exporter'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async'

export type LocalExporterOptions = {
  /** Path to directory, where results will be exported. If not provided will use `os.tmpdir()`. */
  path?: string
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
  static getOctopusFileName = getOctopusFileName

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
    await makeDir(path.join(dir, IMAGES_DIR_NAME))
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

  getBasePath(): Promise<string> {
    return this._outputDir
  }

  async completed(): Promise<void> {
    await this._completed.promise
    await Promise.all(this._assetsSaves)
  }

  finalizeExport(): void {
    this._completed.resolve()
  }

  /**
   * Exports given OctopusComponent
   * @param {ComponentConversionResult} result contains converted OctopusComponent or Error if conversion failed
   * @returns {Promise<string | null>} returns path to the exported OctopusComponent or `null` if conversion failed
   */
  exportComponent(result: ComponentConversionResult): Promise<string | null> {
    if (!result.value) return Promise.resolve(null)
    return this._save(getOctopusFileName(result.id), stringify(result.value))
  }

  /**
   * Exports given Image into folder specified in `DebugExporter.IMAGES_DIR_NAME`
   * @param {string} name Name of the exported Image
   * @param {Buffer} buffer image data
   * @returns {Promise<string>} returns path to the exported Image
   */
  async exportImage(name: string, buffer: Buffer): Promise<string> {
    return this._save(path.join(LocalExporter.IMAGES_DIR_NAME, path.basename(name)), buffer)
  }

  /**
   * Exports given converted OctopusManifest.
   * @param {DesignConversionResult} result contains converted OctopusManifest + conversion Time
   * @returns {Promise<string>} returns path to the OctopusManifest
   */
  async exportManifest(result: DesignConversionResult): Promise<string> {
    return this._save(MANIFEST_NAME, stringify(result.manifest))
  }
}
