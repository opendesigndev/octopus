import EventEmitter from 'events'
import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async'
import { timestamp } from '@opendesign/octopus-common/dist/utils/timestamp'
import { v4 as uuidv4 } from 'uuid'

import {
  getOctopusFileName,
  getPreviewFileName,
  getSourceFileName,
  IMAGES_DIR_NAME,
  IMAGE_EXTNAME,
  MANIFEST_FILE_NAME,
} from '../../../utils/exporter'
import { makeDir, saveFile } from '../../../utils/files'
import { stringify } from '../../../utils/misc'

import type { Manifest } from '../../../typings/manifest'
import type { ComponentConversionResult } from '../../conversion/design-converter'
import type { AbstractExporter } from '../abstract-exporter'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async'

type DebugExporterOptions = {
  designId?: string
  tempDir: string
}

export class DebugExporter extends EventEmitter implements AbstractExporter {
  _outputDir: Promise<string>
  _tempDir: string
  _assetsSaves: Promise<unknown>[]
  _completed: DetachedPromiseControls<void>
  _manifestPath: string | undefined

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
    await makeDir(path.join(tempPath, IMAGES_DIR_NAME))
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
    this.emit('octopus:manifest', this.manifestPath)
    this._completed.resolve()
  }

  get manifestPath(): string | undefined {
    return this._manifestPath
  }

  set manifestPath(path: string | undefined) {
    this._manifestPath = path
  }

  async exportRawDesign(raw: unknown): Promise<string> {
    const rawPath = getSourceFileName('design')
    const savedPath = await this._save(rawPath, stringify(raw))
    this.emit('raw:design', savedPath)
    return rawPath
  }

  async exportRawComponent(raw: unknown, name: string): Promise<string> {
    const rawPath = getSourceFileName(name)
    const savedPath = await this._save(rawPath, stringify(raw))
    this.emit('raw:component', savedPath)
    return rawPath
  }

  async exportRawChunk(raw: unknown, name: string): Promise<string> {
    const rawPath = getSourceFileName(name)
    const savedPath = await this._save(rawPath, stringify(raw))
    this.emit('raw:chunk', savedPath)
    return rawPath
  }

  async exportComponent(
    result: ComponentConversionResult,
    role: Manifest['Component']['role']
  ): Promise<string | null> {
    if (!result.value) {
      this.emit('octopus:component', { ...result }, role)
      return Promise.resolve(null)
    }
    const path = getOctopusFileName(result.id)
    const octopusPath = await this._save(path, stringify(result.value))
    this.emit('octopus:component', { ...result, octopusPath }, role)
    return path
  }

  getImagePath(name: string): string {
    return path.join(IMAGES_DIR_NAME, `${name}${IMAGE_EXTNAME}`)
  }

  async exportImage(name: string, data: ArrayBuffer): Promise<string> {
    const imagePath = this.getImagePath(name)
    const savedPath = await this._save(imagePath, Buffer.from(data))
    this.emit('source:image', savedPath)
    return imagePath
  }

  async exportPreview(id: string, data: ArrayBuffer): Promise<string> {
    const previewPath = getPreviewFileName(id)
    const savedPath = await this._save(previewPath, Buffer.from(data))
    this.emit('source:preview', savedPath)
    return previewPath
  }

  async exportManifest(manifest: Manifest['OctopusManifest']): Promise<string> {
    this.manifestPath = await this._save(MANIFEST_FILE_NAME, stringify(manifest))
    return this.manifestPath
  }
}
