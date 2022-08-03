import SourceDesign from '../../../../entities/source/source-design'
import { unzipArray } from '../unzip'

import type { ArrayBuffersSourceTree } from '../../../../../src/typings'
import type { RawSourceInteractions } from '../../../../entities/source/source-interactions'
import type { RawSourceManifest } from '../../../../entities/source/source-manifest'
import type { RawArtboardLike, RawResources } from '../../../../typings/source'
import type { UnzipFileInfo } from 'fflate'

type XDFileReaderOptions = {
  file: Uint8Array
}

export class XDFileReader {
  private _file: Uint8Array
  private _sourceDesign: Promise<SourceDesign>
  private _decoder: TextDecoder

  static ARTBOARDS = /artwork\/artboard-/
  static RESOURCES = /resources\/graphics\/graphicContent\.agc$/
  static INTERACTIONS = /interactions\/interactions\.json$/
  static MANIFEST = /^manifest$/
  static IMAGES = /resources\/[a-f0-9]{32}/
  static PASTEBOARD = /pasteboard/

  constructor(options: XDFileReaderOptions) {
    this._file = options.file
    this._sourceDesign = this._initSourceDesign(options.file)
    this._decoder = new TextDecoder()
  }

  private _parseDecode(buf: Uint8Array) {
    return JSON.parse(this._decoder.decode(buf))
  }

  get file(): Uint8Array {
    return this._file
  }

  get sourceDesign(): Promise<SourceDesign> {
    return this._sourceDesign
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
        return {
          path: entry.path,
          getImageData: () => Promise.resolve(entry.content),
        }
      })
    )

    const options = {
      manifest: {
        path: sourceTree.manifest?.path,
        rawValue: this._parseDecode(sourceTree.manifest?.content) as RawSourceManifest,
      },
      resources: {
        path: sourceTree.resources?.path,
        rawValue: this._parseDecode(sourceTree.resources?.content) as RawResources,
      },
      interactions: {
        path: sourceTree.interactions?.path,
        rawValue: this._parseDecode(sourceTree.interactions?.content) as RawSourceInteractions,
      },
      images: await images,
      artboards: sourceTree.artboards.map((entry) => {
        return {
          path: entry.path,
          rawValue: this._parseDecode(entry.content) as RawArtboardLike,
        }
      }),
    }

    return new SourceDesign(options)
  }

  async cleanup(): Promise<void> {
    return
  }
}
