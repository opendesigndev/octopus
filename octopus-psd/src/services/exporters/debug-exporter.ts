import EventEmitter from 'events'
import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async'
import { v4 as uuidv4 } from 'uuid'

import { getOctopusFileName, IMAGES_DIR_NAME, SOURCE_NAME, MANIFEST_NAME } from '../../utils/exporter'
import { copyFile, makeDir, saveFile } from '../../utils/files'

import type { ComponentConversionResult, DesignConversionResult } from '../conversion/design-converter'
import type { AbstractExporter } from './abstract-exporter'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async'

type DebugExporterOptions = {
  id?: string
  tempDir: string
}

export class DebugExporter extends EventEmitter implements AbstractExporter {
  _outputDir: Promise<string>
  _tempDir: string
  _assetsSaves: Promise<unknown>[]
  _completed: DetachedPromiseControls<void>

  static IMAGES_DIR_NAME = IMAGES_DIR_NAME
  static MANIFEST_NAME = MANIFEST_NAME
  static SOURCE_NAME = SOURCE_NAME
  static getOctopusFileName = getOctopusFileName

  constructor(options: DebugExporterOptions) {
    super()
    this._tempDir = options.tempDir
    this._outputDir = this._initOutputDir(options)
    this._assetsSaves = []
    this._completed = detachPromiseControls<void>()
  }

  private _stringify(value: unknown) {
    return JSON.stringify(value, null, '  ')
  }

  private async _initOutputDir(options: DebugExporterOptions) {
    const tempDir = path.join(this._tempDir, typeof options.id === 'string' ? options.id : uuidv4())
    await makeDir(path.join(tempDir, IMAGES_DIR_NAME))
    return tempDir
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

  async exportComponent(component: ComponentConversionResult): Promise<string | null> {
    if (!component.value) return Promise.resolve(null)
    const octopusPath = await this._save(getOctopusFileName(component.id), this._stringify(component.value))
    const sourcePath = path.join(await this._outputDir, SOURCE_NAME)
    const result = {
      id: component.id,
      time: component.time,
      error: component.error,
      octopusPath,
      sourcePath,
    }
    this.emit('octopus:component', result)
    return octopusPath
  }

  async exportImage(name: string, location: string): Promise<string> {
    const dir = await this._outputDir
    const fullPath = path.join(dir, IMAGES_DIR_NAME, name)
    const write = copyFile(location, fullPath)
    this._assetsSaves.push(write)
    await write
    return fullPath
  }

  async exportManifest({ manifest }: DesignConversionResult): Promise<string> {
    const manifestPath = await this._save(MANIFEST_NAME, this._stringify(manifest))
    const manifestStatus = manifest.components[0]?.status?.value
    if (manifestStatus === 'READY' || manifestStatus === 'FAILED') {
      this.emit('octopus:manifest', manifestPath)
    }
    return manifestPath
  }
}
