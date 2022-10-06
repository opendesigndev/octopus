import os from 'os'
import path from 'path'

import { detachPromiseControls } from '@avocode/octopus-common/dist/utils/async'
import { v4 as uuidv4 } from 'uuid'

import { getOctopusFileName, IMAGES_DIR_NAME, MANIFEST_NAME } from '../../utils/exporter'
import { copyFile, makeDir, saveFile } from '../../utils/files'

import type { ComponentConversionResult, DesignConversionResult } from '../conversion/design-converter'
import type { AbstractExporter } from './abstract-exporter'
import type { DetachedPromiseControls } from '@avocode/octopus-common/dist/utils/async'

type LocalExporterOptions = {
  path: string
}

export class LocalExporter implements AbstractExporter {
  _outputDir: Promise<string>
  _assetsSaves: Promise<unknown>[]
  _completed: DetachedPromiseControls<void>

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
    await makeDir(path.join(dir, IMAGES_DIR_NAME))
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

  exportComponent(component: ComponentConversionResult): Promise<string | null> {
    if (!component.value) return Promise.resolve(null)
    return this._save(getOctopusFileName(component.id), this._stringify(component.value))
  }

  async exportImage(name: string, location: string): Promise<string> {
    const dir = await this._outputDir
    const fullPath = path.join(dir, IMAGES_DIR_NAME, name)
    const save = copyFile(location, fullPath)
    this._assetsSaves.push(save)
    return save
  }

  async exportManifest(manifest: DesignConversionResult): Promise<string> {
    return this._save(MANIFEST_NAME, this._stringify(manifest.manifest))
  }
}
