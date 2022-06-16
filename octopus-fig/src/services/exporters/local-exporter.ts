import os from 'os'
import path from 'path'

import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import kebabCase from 'lodash/kebabCase'
import { v4 as uuidv4 } from 'uuid'

import { makeDir, saveFile } from '../../utils/files'
import { stringify } from '../../utils/misc'

import type { ArtboardConversionResult, DesignConversionResult } from '../../../src'
import type { AbstractExporter } from './abstract-exporter'
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
  static OCTOPUS_NAME = (id: string): string => `octopus-${kebabCase(id)}.json`
  static MANIFEST_NAME = 'octopus-manifest.json'

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

  exportArtboard(artboard: ArtboardConversionResult): Promise<string | null> {
    if (!artboard.value) return Promise.resolve(null)
    return this._save(LocalExporter.OCTOPUS_NAME(artboard.id), stringify(artboard.value))
  }

  async exportImage(name: string, data: Buffer): Promise<string> {
    const fullName = path.join(LocalExporter.IMAGES_DIR_NAME, `${name}${LocalExporter.IMAGE_EXTNAME}`)
    return await this._save(fullName, data)
  }

  async exportManifest(manifest: DesignConversionResult): Promise<string> {
    return this._save(LocalExporter.MANIFEST_NAME, stringify(manifest.manifest))
  }
}