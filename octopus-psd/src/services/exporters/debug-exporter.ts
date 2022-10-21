import EventEmitter from 'events'
import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async'
import { v4 as uuidv4 } from 'uuid'

import { getOctopusFileName, IMAGES_DIR_NAME, SOURCE_NAME, MANIFEST_NAME } from '../../utils/exporter'
import { copyFile, makeDir, saveFile } from '../../utils/files'
import { stringify } from '../../utils/stringify'

import type { ComponentConversionResult, DesignConversionResult } from '../conversion/design-converter'
import type { AbstractExporter } from './abstract-exporter'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async'

export type DebugExporterOptions = {
  id?: string
  tempDir: string
}

export class DebugExporter extends EventEmitter implements AbstractExporter {
  _outputDir: Promise<string>
  _tempDir: string
  _assetsSaves: Promise<unknown>[]
  _completed: DetachedPromiseControls<void>
  _manifestPath: string | undefined

  static IMAGES_DIR_NAME = IMAGES_DIR_NAME
  static MANIFEST_NAME = MANIFEST_NAME
  static SOURCE_NAME = SOURCE_NAME
  static getOctopusFileName = getOctopusFileName

  /**
   * Exports octopus assets into given `tempDir`.
   * @constructor
   * @param {DebugExporterOptions} [options]
   */
  constructor(options: DebugExporterOptions) {
    super()
    this._tempDir = options.tempDir
    this._outputDir = this._initOutputDir(options.id)
    this._assetsSaves = []
    this._completed = detachPromiseControls<void>()
  }

  get manifestPath(): string | undefined {
    return this._manifestPath
  }

  set manifestPath(path: string | undefined) {
    this._manifestPath = path
  }

  private async _initOutputDir(id?: string) {
    const tempDir = path.join(this._tempDir, typeof id === 'string' ? id : uuidv4())
    await makeDir(path.join(tempDir, IMAGES_DIR_NAME))
    return tempDir
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
    this.emit('octopus:manifest', this.manifestPath)
    this._completed.resolve()
  }

  getBasePath(): Promise<string> {
    return this._outputDir
  }

  /**
   * Exports given OctopusComponent
   * @param {ComponentConversionResult} conversionResult contains converted OctopusComponent or Error if conversion failed
   * @returns {Promise<string | null>} returns path to the exported OctopusComponent or `null` if conversion failed
   */
  async exportComponent(conversionResult: ComponentConversionResult): Promise<string | null> {
    if (!conversionResult.value) return Promise.resolve(null)
    const octopusPath = await this._save(getOctopusFileName(conversionResult.id), stringify(conversionResult.value))
    const sourcePath = path.join(await this._outputDir, SOURCE_NAME)
    const result = {
      id: conversionResult.id,
      time: conversionResult.time,
      error: conversionResult.error,
      octopusPath,
      sourcePath,
    }
    this.emit('octopus:component', result)
    return octopusPath
  }

  /**
   * Exports given Image into folder specified in `DebugExporter.IMAGES_DIR_NAME`
   * @param {string} name Name of the exported Image
   * @param {string} location Location of the given Image
   * @returns {Promise<string>} returns path to the exported Image
   */
  async exportImage(name: string, location: string): Promise<string> {
    const dir = await this._outputDir
    const fullPath = path.join(dir, IMAGES_DIR_NAME, name)
    const write = copyFile(location, fullPath)
    this._assetsSaves.push(write)
    await write
    return fullPath
  }

  /**
   * Exports given converted OctopusManifest.
   * @param {DesignConversionResult} result contains converted OctopusManifest + conversion Time
   * @returns {Promise<string>} returns path to the OctopusManifest
   */
  async exportManifest({ manifest }: DesignConversionResult): Promise<string> {
    this.manifestPath = await this._save(MANIFEST_NAME, stringify(manifest))
    return this.manifestPath
  }
}
