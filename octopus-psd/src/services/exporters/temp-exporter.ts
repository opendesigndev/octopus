import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { mkdir, writeFile } from 'fs/promises'
import EventEmitter from 'events'

import type { AbstractExporter } from './abstract-exporter'
import type { ArtboardConversionResult, DesignConversionResult } from '../..'
import type { SourceArtboard } from '../../entities/source/source-artboard'
import type { SourceDesign } from '../../entities/source/source-design'

type TempExporterOptions = {
  id?: string
  tempDir: string
}

type SourceResources = { source: string }
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
    await mkdir(path.join(tempDir, TempExporter.IMAGES_DIR_NAME), { recursive: true })
    return tempDir
  }

  private async _save(name: string | null, body: string | Buffer) {
    const dir = await this._outputDir
    const fullPath = path.join(dir, typeof name === 'string' ? name : uuidv4())
    await writeFile(fullPath, body)
    return fullPath
  }

  getBasePath(): Promise<string> {
    return this._outputDir
  }

  async exportSourceDesign(design: SourceDesign): Promise<SourceResources> {
    const source = await this._save(TempExporter.SOURCE_NAME, this._stringify(design.artboard.raw))
    const result = { source }
    this.emit('source:resources', result)
    return result
  }

  async exportArtboard(artboard: ArtboardConversionResult): Promise<string> {
    const octopusPath = await this._save(TempExporter.OCTOPUS_NAME, this._stringify(artboard.value))
    const result = {
      id: artboard.id,
      time: artboard.time,
      error: artboard.error,
      octopusPath,
    }
    this.emit('octopus:artboard', result)
    return octopusPath
  }

  // async exportImage(name: string, path: string): Promise<string> {
  //   return this._save(path.join(TempExporter.IMAGES_DIR_NAME, path.basename(name)), data)
  // }

  async exportManifest(manifest: DesignConversionResult): Promise<string> {
    const manifestPath = await this._save(TempExporter.MANIFEST_NAME, this._stringify(manifest.manifest))
    this.emit('octopus:manifest', manifestPath)
    return manifestPath
  }
}
