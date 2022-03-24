import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import EventEmitter from 'events'

import type { AbstractExporter } from './abstract-exporter'
import type { ArtboardConversionResult, DesignConversionResult } from '../..'
import { copyFile, makeDir, saveFile } from '../../utils/files'

type TempExporterOptions = {
  id?: string
  tempDir: string
}

export class TempExporter extends EventEmitter implements AbstractExporter {
  _outputDir: Promise<string>
  _tempDir: string

  static IMAGES_DIR_NAME = 'images'
  static SOURCE_NAME = 'source.json'
  static OCTOPUS_NAME = 'octopus.json'
  static MANIFEST_NAME = 'octopus-manifest.json'

  constructor(options: TempExporterOptions) {
    super()
    this._tempDir = options.tempDir
    this._outputDir = this._initOutputDir(options)
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
    await saveFile(fullPath, body)
    return fullPath
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