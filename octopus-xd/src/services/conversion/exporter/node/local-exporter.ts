import { promises as fsp } from 'fs'
import os from 'os'
import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async'
import { v4 as uuidv4 } from 'uuid'

import type { Exporter } from '..'
import type { SourceArtboard } from '../../../../entities/source/source-artboard'
import type { ArtboardConversionResult, DesignConversionResult } from '../../../../octopus-xd-converter'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async'

type LocalExporterOptions = {
  path: string
}

export class LocalExporter implements Exporter {
  _outputDir: Promise<string>
  _assetsSaves: Promise<unknown>[]
  _completed: DetachedPromiseControls<void>

  static IMAGES_DIR_NAME = 'images'
  static OCTOPUS_MANIFEST_NAME = 'octopus-manifest.json'

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
    await fsp.mkdir(path.join(dir, LocalExporter.IMAGES_DIR_NAME), { recursive: true })
    return dir
  }

  private async _save(name: string | null, body: string | Buffer) {
    const dir = await this._outputDir
    const fullPath = path.join(dir, typeof name === 'string' ? name : uuidv4())
    const write = fsp.writeFile(fullPath, body)
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

  exportArtboard(_: SourceArtboard, artboard: ArtboardConversionResult): Promise<string | null> {
    if (!artboard.value) return Promise.resolve(null)
    return this._save(`octopus-${artboard.id}.json`, this._stringify(artboard.value))
  }

  exportImage(name: string, data: Uint8Array): Promise<string> {
    return this._save(path.join(LocalExporter.IMAGES_DIR_NAME, path.basename(name)), Buffer.from(data))
  }

  async exportManifest(manifest: DesignConversionResult): Promise<string> {
    return this._save(LocalExporter.OCTOPUS_MANIFEST_NAME, this._stringify(manifest.manifest))
  }
}
