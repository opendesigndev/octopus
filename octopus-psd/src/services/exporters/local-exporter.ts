import type { DetachedPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import os from 'os'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import type { ArtboardConversionResult, DesignConversionResult } from '../../../src'
import { copyFile, makeDir, saveFile } from '../../utils/files'
import type { AbstractExporter } from './abstract-exporter'

type LocalExporterOptions = {
  path: string
}

export class LocalExporter implements AbstractExporter {
  _outputDir: Promise<string>
  _assetsSaves: Promise<unknown>[]
  _completed: DetachedPromiseControls<void>

  static IMAGES_DIR_NAME = 'images'
  static OCTOPUS_NAME = 'octopus.json'
  static MANIFEST_NAME = 'octopus-manifest.json'

  constructor(options: LocalExporterOptions) {
    this._outputDir = this._initTempDir(options)
    this._assetsSaves = []
    this._completed = detachPromiseControls<void>()
  }

  private _stringify(value: unknown) {
    return JSON.stringify(value, null, '  ')
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
    return saveFile(fullPath, body)
  }

  getBasePath(): Promise<string> {
    return this._outputDir
  }

  async completed(): Promise<void> {
    await this._completed.promise
    await Promise.all(this._assetsSaves)
  }

  exportArtboard(artboard: ArtboardConversionResult): Promise<string | null> {
    if (!artboard.value) return Promise.resolve(null)
    const save = this._save(LocalExporter.OCTOPUS_NAME, this._stringify(artboard.value))
    this._assetsSaves.push(save)
    return save
  }

  async exportImage(name: string, location: string): Promise<string> {
    const dir = await this._outputDir
    const fullPath = path.join(dir, LocalExporter.IMAGES_DIR_NAME, name)
    const save = copyFile(location, fullPath)
    this._assetsSaves.push(save)
    return save
  }

  async exportManifest(manifest: DesignConversionResult): Promise<string> {
    const save = await this._save(LocalExporter.MANIFEST_NAME, this._stringify(manifest.manifest))
    this._completed.resolve()
    return save
  }
}
