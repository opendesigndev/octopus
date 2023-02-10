import fsp from 'fs/promises'
import os from 'os'
import path from 'path'

import { JSONFromTypedArray } from '@opendesign/octopus-common/utils/common'
import { v4 as uuidv4 } from 'uuid'

import { SourceDesign } from '../../../../entities/source/source-design'
import { unzipArray } from '../unzip'

import type { ArrayBuffersSourceTree } from '../../../../../src/typings'
import type { RawSourceInteractions } from '../../../../entities/source/source-interactions'
import type { RawSourceManifest } from '../../../../entities/source/source-manifest'
import type { RawArtboardLike, RawResources } from '../../../../typings/source'
import type { UnzipFileInfo } from 'fflate'

type XDFileReaderOptions = {
  file: Uint8Array
  storeAssetsOnFs?: boolean
}

export class XDFileReader {
  private _file: Uint8Array
  private _storeAssetsOnFs: boolean
  private _tempAssetsLocation: Promise<string | null>
  private _sourceDesign: Promise<SourceDesign>

  static ARTBOARDS = /artwork\/artboard-/
  static RESOURCES = /resources\/graphics\/graphicContent\.agc$/
  static INTERACTIONS = /interactions\/interactions\.json$/
  static MANIFEST = /^manifest$/
  static IMAGES = /resources\/[a-f0-9]{32}/
  static PASTEBOARD = /pasteboard/

  constructor(options: XDFileReaderOptions) {
    this._file = options.file
    this._storeAssetsOnFs = options.storeAssetsOnFs ?? false
    this._tempAssetsLocation = this._initTempAssetsLocation()
    this._sourceDesign = this._initSourceDesign(options.file)
  }

  get file(): Uint8Array {
    return this._file
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

  private async _initSourceDesign(file: Uint8Array) {
    return this._fromSourceTree(await this._createSourceTree(file))
  }

  private async _createSourceTree(file: Uint8Array): Promise<ArrayBuffersSourceTree> {
    const targetEntries = [
      XDFileReader.ARTBOARDS,
      XDFileReader.RESOURCES,
      XDFileReader.INTERACTIONS,
      XDFileReader.MANIFEST,
      XDFileReader.IMAGES,
      XDFileReader.PASTEBOARD,
    ]
    const filter = (file: UnzipFileInfo) => {
      return targetEntries.some((regex) => {
        return regex.test(file.name)
      })
    }
    const fileContent = await unzipArray({ file, filter })
    const structure = {
      manifest: fileContent.find((entry) => XDFileReader.MANIFEST.test(entry.path)) || null,
      resources: fileContent.find((entry) => XDFileReader.RESOURCES.test(entry.path)) || null,
      interactions: fileContent.find((entry) => XDFileReader.INTERACTIONS.test(entry.path)) || null,
      images: fileContent.filter((entry) => XDFileReader.IMAGES.test(entry.path)),
      artboards: fileContent.filter((entry) => {
        return XDFileReader.ARTBOARDS.test(entry.path) || XDFileReader.PASTEBOARD.test(entry.path)
      }),
    }

    return structure
  }

  private async _fromSourceTree(sourceTree: ArrayBuffersSourceTree): Promise<SourceDesign> {
    if (!sourceTree.manifest?.content) {
      throw new Error('Missing "manifest" ArrayBuffer entry from the source design.')
    }

    if (!sourceTree.interactions?.content) {
      throw new Error('Missing "interactions" ArrayBuffer entry from the source design.')
    }

    if (!sourceTree.resources?.content) {
      throw new Error('Missing "resources" ArrayBuffer entry from the source design.')
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
      manifest: {
        path: sourceTree.manifest?.path,
        rawValue: JSONFromTypedArray(sourceTree.manifest?.content) as RawSourceManifest,
      },
      resources: {
        path: sourceTree.resources?.path,
        rawValue: JSONFromTypedArray(sourceTree.resources?.content) as RawResources,
      },
      interactions: {
        path: sourceTree.interactions?.path,
        rawValue: JSONFromTypedArray(sourceTree.interactions?.content) as RawSourceInteractions,
      },
      images: await images,
      artboards: sourceTree.artboards.map((entry) => {
        return {
          path: entry.path,
          rawValue: JSONFromTypedArray(entry.content) as RawArtboardLike,
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
