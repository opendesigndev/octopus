import os from 'os'
import path from 'path'

import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import kebabCase from 'lodash/kebabCase'
import { v4 as uuidv4 } from 'uuid'

import { makeDir, saveFile } from '../../../utils/files'
import { stringify } from '../../../utils/misc'

import type { Manifest } from '../../../typings/manifest'
import type { ComponentConversionResult } from '../../conversion/design-converter'
import type { AbstractExporter } from '../abstract-exporter'
import type { DetachedPromiseControls } from '@avocode/octopus-common/dist/utils/async'

type LocalExporterOptions = {
  path: string
}

export class LocalExporter implements AbstractExporter {
  _outputDir: Promise<string>
  _assetsSaves: Promise<unknown>[]
  _completed: DetachedPromiseControls<void>

  static IMAGES_DIR_NAME = 'images'
  static IMAGE_EXTNAME = '.png'
  static MANIFEST_PATH = 'octopus-manifest.json'
  static getOctopusPath = (id: string): string => `${kebabCase(id)}-octopus.json`
  static getPreviewPath = (id: string): string => `${kebabCase(id)}-preview${LocalExporter.IMAGE_EXTNAME}`
  static getSourcePath = (id: string): string => `${kebabCase(id)}-source.json`

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

  async exportRawDesign(raw: unknown): Promise<string> {
    const rawPath = LocalExporter.getSourcePath('design')
    await this._save(rawPath, stringify(raw))
    return rawPath
  }

  async exportRawComponent(raw: unknown, name: string): Promise<string> {
    const rawPath = LocalExporter.getSourcePath(name)
    await this._save(rawPath, stringify(raw))
    return rawPath
  }

  async exportRawChunk(raw: unknown, name: string): Promise<string> {
    const rawPath = LocalExporter.getSourcePath(name)
    await this._save(rawPath, stringify(raw))
    return rawPath
  }
  async exportComponent(result: ComponentConversionResult): Promise<string | null> {
    if (!result.value) return null
    const path = LocalExporter.getOctopusPath(result.id)
    await this._save(path, stringify(result.value))
    return path
  }

  getImagePath(name: string): string {
    return path.join(LocalExporter.IMAGES_DIR_NAME, `${name}${LocalExporter.IMAGE_EXTNAME}`)
  }

  async exportImage(name: string, data: ArrayBuffer): Promise<string> {
    const imagePath = this.getImagePath(name)
    await this._save(imagePath, Buffer.from(data))
    return imagePath
  }

  getPreviewPath(id: string): string {
    return LocalExporter.getPreviewPath(id)
  }

  async exportPreview(id: string, data: ArrayBuffer): Promise<string> {
    const previewPath = this.getPreviewPath(id)
    await this._save(previewPath, Buffer.from(data))
    return previewPath
  }

  async exportManifest(manifest: Manifest['OctopusManifest']): Promise<string> {
    return this._save(LocalExporter.MANIFEST_PATH, stringify(manifest))
  }
}
