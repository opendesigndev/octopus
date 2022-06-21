import EventEmitter from 'events'
import path from 'path'

import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import kebabCase from 'lodash/kebabCase'
import { v4 as uuidv4 } from 'uuid'

import { makeDir, saveFile } from '../../utils/files'
import { stringify } from '../../utils/misc'
import { timestamp } from '../../utils/timestamp'

import type { ArtboardConversionResult, DesignConversionResult } from '../..'
import type { AbstractExporter } from './abstract-exporter'
import type { DetachedPromiseControls } from '@avocode/octopus-common/dist/utils/async'

type TempExporterOptions = {
  designId?: string
  tempDir: string
}

export class TempExporter extends EventEmitter implements AbstractExporter {
  _outputDir: Promise<string>
  _tempDir: string
  _assetsSaves: Promise<unknown>[]
  _completed: DetachedPromiseControls<void>

  static IMAGES_DIR_NAME = 'images'
  static IMAGE_EXTNAME = '.png'
  static OCTOPUS_NAME = (id: string): string => `octopus-${kebabCase(id)}.json`
  static MANIFEST_NAME = 'octopus-manifest.json'
  static SOURCE_NAME = (id: string): string => `source-${kebabCase(id)}.json`

  constructor(options: TempExporterOptions) {
    super()
    this._tempDir = options.tempDir
    this._outputDir = this._initOutputDir(options)
    this._assetsSaves = []
    this._completed = detachPromiseControls<void>()
  }

  private async _initOutputDir(options: TempExporterOptions) {
    const dirName = typeof options.designId === 'string' ? `${timestamp()}-${options.designId}` : uuidv4()
    const tempPath = path.join(this._tempDir, dirName)
    await makeDir(path.join(tempPath, TempExporter.IMAGES_DIR_NAME))
    return tempPath
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

  async exportSource(raw: unknown, name = 'design'): Promise<string> {
    const sourcePath = await this._save(TempExporter.SOURCE_NAME(name), stringify(raw))
    this.emit('source:design', sourcePath)
    return sourcePath
  }

  async exportArtboard(artboard: ArtboardConversionResult): Promise<string | null> {
    if (!artboard.value) {
      this.emit('octopus:artboard', { ...artboard, value: undefined })
      return Promise.resolve(null)
    }
    const octopusPath = await this._save(
      TempExporter.OCTOPUS_NAME(`${artboard.id}-${artboard.value.content?.name}`),
      stringify(artboard.value)
    )
    this.emit('octopus:artboard', { ...artboard, value: undefined, octopusPath })
    return octopusPath
  }

  getImagePath(name: string): string {
    return path.join(TempExporter.IMAGES_DIR_NAME, `${name}${TempExporter.IMAGE_EXTNAME}`)
  }

  async exportImage(name: string, data: Buffer): Promise<string> {
    const fullName = this.getImagePath(name)
    const imagePath = await this._save(fullName, data)
    this.emit('source:image', imagePath)
    return imagePath
  }

  async exportPreview(name: string, data: Buffer): Promise<string> {
    const fullName = path.join(`octopus-${kebabCase(name)}preview${TempExporter.IMAGE_EXTNAME}`)
    const imagePath = await this._save(fullName, data)
    this.emit('source:preview', imagePath)
    return imagePath
  }

  async exportManifest({ manifest }: DesignConversionResult, shouldEmit = false): Promise<string> {
    const manifestPath = await this._save(TempExporter.MANIFEST_NAME, stringify(manifest))
    if (shouldEmit) this.emit('octopus:manifest', manifestPath)
    return manifestPath
  }
}
