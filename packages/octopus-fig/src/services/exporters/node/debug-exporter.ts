import EventEmitter from 'events'
import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'
import { traverseAndFind } from '@opendesign/octopus-common/dist/utils/common.js'
import { timestamp } from '@opendesign/octopus-common/dist/utils/timestamp.js'
import kebabCase from 'lodash/kebabCase.js'
import { v4 as uuidv4 } from 'uuid'

import { MANIFEST_NAME } from '../../../utils/const.js'
import { makeDir, saveFile } from '../../../utils/files.js'
import { stringify } from '../../../utils/misc.js'

import type { Manifest } from '../../../typings/manifest.js'
import type { RawDesign, RawLayerContainer } from '../../../typings/raw/index.js'
import type { ComponentConversionResult } from '../../conversion/design-converter.js'
import type { AbstractExporter } from '../abstract-exporter.js'
import type { ResolvedStyle } from '@opendesign/figma-parser'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'

type DebugExporterOptions = {
  /** Path to directory, where designs outputs should be exported. */
  tempDir: string
  /** Unique ID of the exported design. If not given, will be generated by UUIDv4. Exporter outputs will be generated into `tempDir/id` folder. */
  designId?: string
}

export type ComponentDependencies = { images: Promise<string>[] }

export const IMAGES_DIR_NAME = 'images'
export const IMAGE_EXTNAME = '.png'

export function getOctopusFileName(id: string): string {
  return `${kebabCase(id)}-octopus.json`
}

export function getPreviewFileName(id: string): string {
  return `${kebabCase(id)}-preview${IMAGE_EXTNAME}`
}

export function getSourceFileName(id: string): string {
  return `${kebabCase(id)}-source.json`
}

/**
 * Exporter created to be used in manual runs.
 */
export class DebugExporter extends EventEmitter implements AbstractExporter {
  private _outputDir: Promise<string>
  private _tempDir: string
  private _assetsSaves: Promise<unknown>[]
  private _completed: DetachedPromiseControls<void>
  private _imageMap: { [key: string]: DetachedPromiseControls<string> | undefined }
  private _manifestPath: string | undefined

  static IMAGES_DIR_NAME = IMAGES_DIR_NAME
  static MANIFEST_NAME = MANIFEST_NAME
  static getSourceFileName = getSourceFileName
  static getOctopusFileName = getOctopusFileName
  static getPreviewFileName = getPreviewFileName

  /**
   * Exports octopus assets into given `tempDir`.
   * @constructor
   * @param {DebugExporterOptions} [options]
   */
  constructor(options: DebugExporterOptions) {
    super()
    this._tempDir = options.tempDir
    this._outputDir = this._initOutputDir(options)
    this._assetsSaves = []
    this._completed = detachPromiseControls<void>()
    this._imageMap = {}
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
    if (this._manifestPath) this.emit('octopus:manifest', this._manifestPath)
    this._completed.resolve()
  }

  /**
   * Exports given design raw data.
   * @param {RawDesign} raw Design raw data
   * @returns {Promise<string>} returns path to the exported RawDesign
   */
  async exportRawDesign(raw: RawDesign): Promise<string> {
    const rawPath = DebugExporter.getSourceFileName('design')
    const savedPath = await this._save(rawPath, stringify(raw))
    this.emit('raw:design', savedPath)
    return rawPath
  }

  /**
   * Exports raw data of given Component.
   * @param {RawLayerContainer} raw Component raw data
   * @param {string} name Name of given Component
   * @returns {Promise<string>} returns path to the exported RawComponent
   */
  async exportRawComponent(raw: RawLayerContainer, name: string): Promise<string> {
    const rawPath = DebugExporter.getSourceFileName(name)
    const savedPath = await this._save(rawPath, stringify(raw))
    this.emit('raw:component', savedPath)
    return rawPath
  }

  /**
   * Exports raw data of given chunk.
   * @param {ResolvedStyle} raw Chunk raw data
   * @param {string} name Name of given Chunk
   * @returns {Promise<string>} returns path to the exported RawChunk
   */
  async exportRawChunk(raw: ResolvedStyle, name: string): Promise<string> {
    const rawPath = DebugExporter.getSourceFileName(name)
    const savedPath = await this._save(rawPath, stringify(raw))
    this.emit('raw:chunk', savedPath)
    return rawPath
  }

  private getComponentDependencies(value: Record<string, unknown>): ComponentDependencies {
    const imageIds: string[] = traverseAndFind(value, (obj: unknown) => {
      const imagePath = Object(obj)?.image?.ref?.value
      if (imagePath) return imagePath
    })
    imageIds.forEach((imageId) => {
      if (!this._imageMap[imageId]) this._imageMap[imageId] = detachPromiseControls()
    })
    const images = imageIds.map((id) => this._imageMap[id]?.promise).filter((id): id is Promise<string> => Boolean(id))
    return { images }
  }

  /**
   * Exports given OctopusComponent
   * @param {ComponentConversionResult} result contains converted OctopusComponent or Error if conversion failed
   * @param {Manifest['Component']['role']} [role] Role/Type of given OctopusComponent.
   * @returns {Promise<string | null>} returns path to the exported OctopusComponent or `null` if conversion failed
   */
  async exportComponent(
    result: ComponentConversionResult,
    role: Manifest['Component']['role']
  ): Promise<string | null> {
    if (!result.value) {
      this.emit('octopus:component', { ...result }, role)
      return Promise.resolve(null)
    }
    const path = DebugExporter.getOctopusFileName(result.id)
    const octopusPath = await this._save(path, stringify(result.value))
    const dependencies = this.getComponentDependencies(result.value)
    this.emit('octopus:component', { ...result, octopusPath, dependencies }, role)
    return path
  }

  getImagePath(name: string): string {
    return path.join(DebugExporter.IMAGES_DIR_NAME, `${name}${IMAGE_EXTNAME}`)
  }

  /**
   * Exports given Image into folder specified in `DebugExporter.IMAGES_DIR_NAME`
   * @param {string} name Name of the exported Image
   * @param {ArrayBuffer} data Image data represented as buffer of binary data
   * @returns {Promise<string>} returns path to the exported Image
   */
  async exportImage(name: string, data: ArrayBuffer): Promise<string> {
    const imagePath = this.getImagePath(name)
    if (!this._imageMap[imagePath]) this._imageMap[imagePath] = detachPromiseControls()
    const savedPath = await this._save(imagePath, Buffer.from(data))
    this._imageMap[imagePath]?.resolve(savedPath)
    this.emit('source:image', savedPath)
    return imagePath
  }

  /**
   * Exports given Image Preview into folder specified in `DebugExporter.getPreviewFileName()`
   * @param {string} id ID of the exported Image
   * @param {ArrayBuffer} data Image data represented as buffer of binary data
   * @returns {Promise<string>} returns path to the exported Image Preview
   */
  async exportPreview(id: string, data: ArrayBuffer): Promise<string> {
    const previewPath = DebugExporter.getPreviewFileName(id)
    const savedPath = await this._save(previewPath, Buffer.from(data))
    this.emit('source:preview', savedPath)
    return previewPath
  }

  /**
   * Exports given converted OctopusManifest.
   * @param {Manifest['OctopusManifest']} manifest Given converted OctopusManifest data object.
   * @returns {Promise<string>} returns path to the OctopusManifest
   */
  async exportManifest(manifest: Manifest['OctopusManifest']): Promise<string> {
    this._manifestPath = await this._save(DebugExporter.MANIFEST_NAME, stringify(manifest))
    return this._manifestPath
  }
}
