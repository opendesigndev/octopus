import { DetachedPromiseControls, detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import EventEmitter from 'events'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import type { ArtboardConversionResult, DesignConversionResult } from '../..'
import { copyFile, makeDir, saveFile } from '../../utils/files'
import type { AbstractExporter } from './abstract-exporter'

type TempExporterOptions = {
  id?: string
  tempDir: string
}

export class TempExporter extends EventEmitter implements AbstractExporter {
  _outputDir: Promise<string>
  _tempDir: string
  _assetsSaves: Promise<unknown>[]
  _completed: DetachedPromiseControls<void>

  static IMAGES_DIR_NAME = 'images'
  static SOURCE_NAME = 'source.json'
  static OCTOPUS_NAME = 'octopus.json'
  static MANIFEST_NAME = 'octopus-manifest.json'

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
    await makeDir(path.join(tempDir, TempExporter.IMAGES_DIR_NAME))
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
    this._completed.resolve()
  }

  getBasePath(): Promise<string> {
    return this._outputDir
  }

  async exportArtboard(artboard: ArtboardConversionResult): Promise<string> {
    const octopusPath = await this._save(TempExporter.OCTOPUS_NAME, this._stringify(artboard.value))
    const sourcePath = path.join(await this._outputDir, TempExporter.SOURCE_NAME)
    const result = {
      id: artboard.id,
      time: artboard.time,
      error: artboard.error,
      octopusPath,
      sourcePath,
    }
    this.emit('octopus:artboard', result)
    return octopusPath
  }

  async exportImage(name: string, location: string): Promise<string> {
    const dir = await this._outputDir
    const fullPath = path.join(dir, TempExporter.IMAGES_DIR_NAME, name)
    await copyFile(location, fullPath)
    return fullPath
  }

  async exportManifest(manifest: DesignConversionResult): Promise<string> {
    const manifestPath = await this._save(TempExporter.MANIFEST_NAME, this._stringify(manifest.manifest))
    this.emit('octopus:manifest', manifestPath)
    return manifestPath
  }
}
