import EventEmitter from 'events'
import path from 'path'

import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import kebabCase from 'lodash/kebabCase'
import { v4 as uuidv4 } from 'uuid'

import { makeDir, saveFile } from '../../utils/files'
import { stringify } from '../../utils/misc'
import { timestamp } from '../../utils/timestamp'

import type { ArtboardConversionResult } from '../..'
import type { Manifest } from '../../typings/manifest'
import type { AbstractExporter } from './abstract-exporter'
import type { DetachedPromiseControls } from '@avocode/octopus-common/dist/utils/async'

type DebugExporterOptions = {
  designId?: string
  tempDir: string
}

export class DebugExporter extends EventEmitter implements AbstractExporter {
  _outputDir: Promise<string>
  _tempDir: string
  _assetsSaves: Promise<unknown>[]
  _completed: DetachedPromiseControls<void>

  static IMAGES_DIR_NAME = 'images'
  static IMAGE_EXTNAME = '.png'
  static MANIFEST_PATH = 'octopus-manifest.json'
  static getOctopusPath = (id: string): string => `${kebabCase(id)}-octopus.json`
  static getPreviewPath = (id: string): string => `${kebabCase(id)}-preview${DebugExporter.IMAGE_EXTNAME}`
  static getSourcePath = (id: string): string => `${kebabCase(id)}-source.json`

  constructor(options: DebugExporterOptions) {
    super()
    this._tempDir = options.tempDir
    this._outputDir = this._initOutputDir(options)
    this._assetsSaves = []
    this._completed = detachPromiseControls<void>()
  }

  private async _initOutputDir(options: DebugExporterOptions) {
    const dirName = typeof options.designId === 'string' ? `${timestamp()}-${options.designId}` : uuidv4()
    const tempPath = path.join(this._tempDir, dirName)
    await makeDir(path.join(tempPath, DebugExporter.IMAGES_DIR_NAME))
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
    const sourcePath = await this._save(DebugExporter.getSourcePath(name), stringify(raw))
    this.emit('source:design', sourcePath)
    return sourcePath
  }

  async exportArtboard(artboard: ArtboardConversionResult): Promise<string | null> {
    if (!artboard.value) {
      this.emit('octopus:artboard', { ...artboard })
      return Promise.resolve(null)
    }
    const octopusPath = await this._save(DebugExporter.getOctopusPath(artboard.id), stringify(artboard.value))
    this.emit('octopus:artboard', { ...artboard, octopusPath })
    return octopusPath
  }

  getImagePath(name: string): string {
    return path.join(DebugExporter.IMAGES_DIR_NAME, `${name}${DebugExporter.IMAGE_EXTNAME}`)
  }

  async exportImage(name: string, data: ArrayBuffer): Promise<string> {
    const imagePath = this.getImagePath(name)
    const savedPath = await this._save(imagePath, Buffer.from(data))
    this.emit('source:image', savedPath)
    return imagePath
  }

  getPreviewPath(id: string): string {
    return DebugExporter.getPreviewPath(id)
  }

  async exportPreview(id: string, data: ArrayBuffer): Promise<string> {
    const previewPath = this.getPreviewPath(id)
    const savedPath = await this._save(previewPath, Buffer.from(data))
    this.emit('source:preview', savedPath)
    return previewPath
  }

  async exportManifest(manifest: Manifest['OctopusManifest'], isFinal = false): Promise<string> {
    const manifestPath = await this._save(DebugExporter.MANIFEST_PATH, stringify(manifest))
    if (isFinal) this.emit('octopus:manifest', manifestPath)
    return manifestPath
  }
}
