import { JSONFromTypedArray } from '@avocode/octopus-common/dist/utils/common'

import { unzipArray } from './unzip'
import SourceDesign from '../../../entities/source/source-design'

import type { UnzipFileInfo } from 'fflate'
import type { ArrayBuffersSourceTree } from '../../../../src/typings'
import type { RawSourceManifest } from '../../../entities/source/source-manifest'
import type { RawArtboardLike, RawResources } from '../../../typings/source'
import type { RawSourceInteractions } from '../../../entities/source/source-interactions'

type XDFileReaderOptions = {
  path: string
}

export class XDFileReader {
  private _path: string
  private _sourceDesign: Promise<SourceDesign>

  static ARTBOARDS = /artwork\/artboard-/
  static RESOURCES = /resources\/graphics\/graphicContent\.agc$/
  static INTERACTIONS = /interactions\/interactions\.json$/
  static MANIFEST = /^manifest$/
  static IMAGES = /resources\/[a-f0-9]{32}/
  static PASTEBOARD = /pasteboard/

  constructor(options: XDFileReaderOptions) {
    this._path = options.path
    this._sourceDesign = this._initSourceDesign(options.path)
  }

  get path(): string {
    return this._path
  }

  get sourceDesign(): Promise<SourceDesign> {
    return this._sourceDesign
  }

  private async _initSourceDesign(path: string) {
    return this._fromSourceTree(await this._createSourceTree(path))
  }

  private async _createSourceTree(filename: string): Promise<ArrayBuffersSourceTree> {
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
    const fileContent = await unzipArray({ filename, filter })
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

  private _fromSourceTree(sourceTree: ArrayBuffersSourceTree): SourceDesign {
    if (!sourceTree.manifest?.content) {
      throw new Error('Missing "manifest" ArrayBuffer entry from the source design.')
    }

    if (!sourceTree.interactions?.content) {
      throw new Error('Missing "interactions" ArrayBuffer entry from the source design.')
    }

    if (!sourceTree.resources?.content) {
      throw new Error('Missing "resources" ArrayBuffer entry from the source design.')
    }

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
      images: sourceTree.images.map((entry) => {
        return {
          path: entry.path,
          rawValue: Buffer.from(entry.content),
        }
      }),
      artboards: sourceTree.artboards.map((entry) => {
        return {
          path: entry.path,
          rawValue: JSONFromTypedArray(entry.content) as RawArtboardLike,
        }
      }),
    }

    return new SourceDesign(options)
  }
}
