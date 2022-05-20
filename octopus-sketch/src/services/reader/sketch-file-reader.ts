import fsp from 'fs/promises'
import os from 'os'
import path from 'path'

import { JSONFromTypedArray } from '@avocode/octopus-common/dist/utils/common'
import { v4 as uuidv4 } from 'uuid'

import { SourceDesign } from '../../entities/source/source-design'
import { unzipArray } from './unzip'

import type { ArrayBuffersSourceTree } from '../../typings'
import type SketchFormat from '@sketch-hq/sketch-file-format-ts'
import type { UnzipFileInfo } from 'fflate'

type SketchFileReaderOptions = {
  path: string
  storeAssetsOnFs?: boolean
}

export class SketchFileReader {
  private _path: string
  private _storeAssetsOnFs: boolean
  private _tempAssetsLocation: Promise<string | null>
  private _sourceDesign: Promise<SourceDesign>

  static DOCUMENT = /^document\.json$/
  static PAGES = /^pages\/.+\.json$/
  static IMAGES = /^images\//
  static USER = /^user\.json$/
  static META = /^meta\.json$/

  constructor(options: SketchFileReaderOptions) {
    this._path = options.path
    this._storeAssetsOnFs = options.storeAssetsOnFs ?? false
    this._tempAssetsLocation = this._initTempAssetsLocation()
    this._sourceDesign = this._initSourceDesign(options.path)
  }

  get path(): string {
    return this._path
  }

  get sourceDesign(): Promise<SourceDesign> {
    return this._sourceDesign
  }

  private async _initTempAssetsLocation() {
    if (!this._storeAssetsOnFs) return Promise.resolve(null)
    const tmpPath = path.join(os.tmpdir(), uuidv4())
    await fsp.mkdir(tmpPath, { recursive: true })
    return tmpPath
  }

  private async _initSourceDesign(path: string) {
    return this._fromSourceTree(await this._createSourceTree(path))
  }

  private async _createSourceTree(filename: string): Promise<ArrayBuffersSourceTree> {
    const targetEntries = [
      SketchFileReader.DOCUMENT,
      SketchFileReader.PAGES,
      SketchFileReader.IMAGES,
      SketchFileReader.USER,
      SketchFileReader.META,
    ]
    const filter = (file: UnzipFileInfo) => {
      return targetEntries.some((regex) => {
        return regex.test(file.name)
      })
    }
    const fileContent = await unzipArray({ filename, filter })
    const structure = {
      document: fileContent.find((entry) => SketchFileReader.DOCUMENT.test(entry.path)) || null,
      meta: fileContent.find((entry) => SketchFileReader.META.test(entry.path)) || null,
      user: fileContent.find((entry) => SketchFileReader.USER.test(entry.path)) || null,
      images: fileContent.filter((entry) => SketchFileReader.IMAGES.test(entry.path)),
      pages: fileContent.filter((entry) => {
        return SketchFileReader.PAGES.test(entry.path)
      }),
    }

    return structure
  }

  private async _fromSourceTree(sourceTree: ArrayBuffersSourceTree) /*: Promise<SourceDesign> */ {
    if (!sourceTree.document?.content) {
      throw new Error('Missing "document" ArrayBuffer entry from the source design.')
    }

    if (!sourceTree.meta?.content) {
      throw new Error('Missing "meta" ArrayBuffer entry from the source design.')
    }

    if (!sourceTree.user?.content) {
      throw new Error('Missing "user" ArrayBuffer entry from the source design.')
    }

    const images = Promise.all(
      sourceTree.images.map(async (entry) => {
        const tmpPath = await this._tempAssetsLocation
        if (this._storeAssetsOnFs && typeof tmpPath === 'string') {
          const tmpFile = path.join(tmpPath, uuidv4())
          await fsp.writeFile(tmpFile, Buffer.from(entry.content))
          return {
            path: entry.path,
            getImageData: () => fsp.readFile(tmpFile),
          }
        }

        return {
          path: entry.path,
          getImageData: () => Promise.resolve(Buffer.from(entry.content)),
        }
      })
    )

    const options = {
      document: {
        path: sourceTree.document?.path,
        rawValue: JSONFromTypedArray(sourceTree.document?.content) as SketchFormat.Document,
      },
      meta: {
        path: sourceTree.meta?.path,
        rawValue: JSONFromTypedArray(sourceTree.meta?.content) as SketchFormat.Meta,
      },
      user: {
        path: sourceTree.user?.path,
        rawValue: JSONFromTypedArray(sourceTree.user?.content) as SketchFormat.User,
      },
      images: await images,
      pages: sourceTree.pages.map((entry) => {
        return {
          path: entry.path,
          rawValue: JSONFromTypedArray(entry.content) as SketchFormat.Page,
        }
      }),
    }

    return new SourceDesign(options)
  }

  async cleanup(): Promise<void> {
    const tempDir = await this._tempAssetsLocation
    if (typeof tempDir === 'string') {
      await fsp.rm(tempDir, { recursive: true, force: true })
    }
    return
  }
}
