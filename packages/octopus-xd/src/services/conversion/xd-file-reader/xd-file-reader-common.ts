import { unzipArray } from './unzip.js'
import { SourceDesign } from '../../../entities/source/source-design.js'
import { SourceManifest } from '../../../entities/source/source-manifest.js'

import type { ArrayBufferEntry, ArrayBuffersSourceTree } from '../../../../src/typings/index.js'
import type { SourceEntry } from '../../../entities/source/source-entry.js'
import type { RawSourceInteractions } from '../../../entities/source/source-interactions.js'
import type { RawSourceManifest } from '../../../entities/source/source-manifest.js'
import type { RawArtboardEntry, RawArtboardLike, RawResources } from '../../../typings/source/index.js'
import type { ComponentMeta, DesignMeta } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'
import type { UnzipFileInfo } from 'fflate'

export abstract class XDFileReaderCommon {
  private _sourceEntry: SourceEntry

  static ARTBOARDS = /artwork\/artboard-/
  static RESOURCES = /resources\/graphics\/graphicContent\.agc$/
  static INTERACTIONS = /interactions\/interactions\.json$/
  static MANIFEST = /^manifest$/
  static IMAGES = /resources\/[a-f0-9]{32}/
  static PASTEBOARD = /pasteboard/

  protected abstract _getBuffer(): Promise<Uint8Array>

  private _getArtboardMeta(
    artboardLike: {
      path: string
      rawValue: RawArtboardLike
    },
    manifest: SourceManifest
  ): ComponentMeta {
    if (artboardLike.path.includes('pasteboard')) {
      const manifestEntry = manifest.getArtboardEntryByPartialPath('pasteboard')
      const id = manifestEntry?.id
      if (!id) throw new Error('Artboard id not found')
      return { id, name: manifestEntry?.name ?? '', role: 'ARTBOARD' }
    }
    const manifestEntry = manifest.getArtboardEntryByPartialPath(artboardLike.path)
    const id =
      artboardLike.rawValue.children?.[0]?.id ||
      (artboardLike.rawValue?.children?.[0] as RawArtboardEntry).artboard?.ref

    if (!id) throw new Error('Artboard id not found')

    return { id, name: manifestEntry?.name ?? '', role: 'ARTBOARD' }
  }

  private async _getSourceEntry(): Promise<SourceEntry> {
    if (!this._sourceEntry) {
      this._sourceEntry = await this._initSourceEntry()
    }

    return this._sourceEntry
  }

  private _getMetaArtboard(sourceEntry: SourceEntry, manifest: SourceManifest) {
    const artboardLikes = sourceEntry.artboards
    return artboardLikes.map((artboardLike) => this._getArtboardMeta(artboardLike, manifest))
  }

  /**
   * Returns @DesignMeta object.
   */
  async getDesignMeta(): Promise<DesignMeta> {
    const sourceEntry = await this._getSourceEntry()
    const manifest = new SourceManifest({ rawValue: sourceEntry.manifest.rawValue })

    return {
      name: manifest.name ?? '',
      components: this._getMetaArtboard(sourceEntry, manifest),
      pages: [],
      origin: {
        name: 'XD',
        version: manifest.xdVersion ?? '0',
      },
    }
  }

  protected abstract _parseDecode(buf: Uint8Array): unknown

  protected abstract _processImage(entry: ArrayBufferEntry): Promise<{
    path: string
    getImageData: () => Promise<Uint8Array>
  }>

  private async _initSourceEntry(): Promise<SourceEntry> {
    const sourceTree = await this._createSourceTree()

    if (!sourceTree.manifest?.content) {
      throw new Error('Missing "manifest" ArrayBuffer entry from the source design.')
    }

    if (!sourceTree.interactions?.content) {
      throw new Error('Missing "interactions" ArrayBuffer entry from the source design.')
    }

    if (!sourceTree.resources?.content) {
      throw new Error('Missing "resources" ArrayBuffer entry from the source design.')
    }

    const images = Promise.all(sourceTree.images.map(async (entry) => this._processImage(entry)))
    return {
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
  }

  private async _createSourceTree(): Promise<ArrayBuffersSourceTree> {
    const file = await this._getBuffer()
    const targetEntries = [
      XDFileReaderCommon.ARTBOARDS,
      XDFileReaderCommon.RESOURCES,
      XDFileReaderCommon.INTERACTIONS,
      XDFileReaderCommon.MANIFEST,
      XDFileReaderCommon.IMAGES,
      XDFileReaderCommon.PASTEBOARD,
    ]
    const filter = (file: UnzipFileInfo) => {
      return targetEntries.some((regex) => {
        return regex.test(file.name)
      })
    }
    const fileContent = await unzipArray({ file, filter })

    return {
      manifest: fileContent.find((entry) => XDFileReaderCommon.MANIFEST.test(entry.path)) || null,
      resources: fileContent.find((entry) => XDFileReaderCommon.RESOURCES.test(entry.path)) || null,
      interactions: fileContent.find((entry) => XDFileReaderCommon.INTERACTIONS.test(entry.path)) || null,
      images: fileContent.filter((entry) => XDFileReaderCommon.IMAGES.test(entry.path)),
      artboards: fileContent.filter((entry) => {
        return XDFileReaderCommon.ARTBOARDS.test(entry.path) || XDFileReaderCommon.PASTEBOARD.test(entry.path)
      }),
    }
  }

  private async _fromSourceEntry(ids?: string[]): Promise<SourceDesign> {
    const sourceEntry = await this._getSourceEntry()
    if (!ids) {
      return new SourceDesign(sourceEntry)
    }

    return new SourceDesign({
      ...sourceEntry,
      artboards: sourceEntry.artboards.filter((artboard) => {
        const id = this._getArtboardMeta(artboard, new SourceManifest({ rawValue: sourceEntry.manifest.rawValue })).id
        return ids.includes(id)
      }),
    })
  }

  abstract cleanup(): Promise<void>

  async getSourceDesign({ ids }: { ids?: string[] } = {}): Promise<SourceDesign> {
    return this._fromSourceEntry(ids)
  }
}
