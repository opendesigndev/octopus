import path from 'path'

import { detachPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'

import { SourceApiReader } from '../../../../src/services/readers/source-api-reader.js'
import { getDirsFromDir, makeDir, saveFile } from '../../../../src/utils/files.js'
import { stringify } from '../../common/utils/stringify.js'

import type { ResolvedDesign, ResolvedFrame, ResolvedStyle, ResolvedPreview } from '@opendesign/figma-parser'
import type { DetachedPromiseControls } from '@opendesign/octopus-common/dist/utils/async.js'

export type AssetUpdaterOptions = Partial<{ selectedAsset: string }>

type EventDesign = {
  event: 'ready:design'
  data: ResolvedDesign
}
type EventFrame = {
  event: 'ready:artboard' | 'ready:component' | 'ready:library'
  data: ResolvedFrame
}
type EventStyle = {
  event: 'ready:style'
  data: ResolvedStyle
}
type EventFill = {
  event: 'ready:fill'
  data: ResolvedFill
}
type EventPreview = {
  event: 'ready:preview'
  data: ResolvedPreview
}

type ResolvedFill = {
  designId: string
  ref: string
  buffer: ArrayBuffer | string
}

export type Event = EventDesign | EventFrame | EventStyle | EventFill | EventPreview

export class AssetUpdater {
  private _assetsDirPath: string
  private _selectedAsset?: string
  private _finalizeAsset: DetachedPromiseControls<void>
  private _eventQueue: Event[]

  static ASSETS_DIR_RELATIVE_PATH = '../assets'
  static ASSET_EVENT_DATA = 'event-data.json'

  constructor({ selectedAsset }: AssetUpdaterOptions) {
    this._assetsDirPath = this._getFullPath()
    this._selectedAsset = selectedAsset
  }

  private _getFullPath(...subpaths: string[]) {
    const dirname = new URL('.', import.meta.url).pathname
    return path.join(dirname, AssetUpdater.ASSETS_DIR_RELATIVE_PATH, ...subpaths)
  }

  private async _onDesign(data: ResolvedDesign) {
    this._eventQueue.push({ event: 'ready:design', data })
    await data.content
    this._finalizeAsset.resolve()
  }

  private async _onStyle(data: ResolvedStyle) {
    this._eventQueue.push({ event: 'ready:style', data })
  }

  private async _onFrame(event: EventFrame['event'], data: ResolvedFrame) {
    this._eventQueue.push({ event, data })
  }

  private async _onFill(data: ResolvedFill) {
    if (typeof data.buffer !== 'string') data.buffer = Buffer.from(data.buffer).toString('base64')
    this._eventQueue.push({ event: 'ready:fill', data })
  }

  private async _onPreview(data: ResolvedPreview) {
    this._eventQueue.push({ event: 'ready:preview', data })
  }

  private async _updateAsset(selectedAsset: string) {
    this._finalizeAsset = detachPromiseControls<void>()
    this._eventQueue = []

    const assetDirPath = this._getFullPath(selectedAsset)
    await makeDir(assetDirPath)

    const readerOptions = {
      designId: selectedAsset,
      token: process.env.API_TOKEN as string,
      ids: [],
      host: 'api.figma.com',
      pixelsLimit: 1e7,
      framePreviews: true,
      previewsParallels: 3,
      tokenType: 'personal',
      nodesParallels: 10,
      s3Parallels: 10,
      verbose: true,
      figmaIdsFetchUsedComponents: true,
      renderImagerefs: false,
      shouldObtainLibraries: true,
      shouldObtainStyles: true,
      parallelRequests: 5,
    }

    const reader = new SourceApiReader(readerOptions)
    const design = reader.getSourceDesign()

    design.on('ready:design', (design) => this._onDesign(design))
    design.on('ready:style', (chunk) => this._onStyle(chunk))
    design.on('ready:artboard', (artboard) => this._onFrame('ready:artboard', artboard))
    design.on('ready:component', (component) => this._onFrame('ready:component', component))
    design.on('ready:library', (library) => this._onFrame('ready:library', library))
    design.on('ready:fill', (fill) => this._onFill(fill))
    design.on('ready:preview', (preview) => this._onPreview(preview))

    await this._finalizeAsset.promise

    const eventDataPath = await saveFile(
      this._getFullPath(selectedAsset, AssetUpdater.ASSET_EVENT_DATA),
      stringify(this._eventQueue)
    )

    console.info(`Asset '${selectedAsset}' updated: ${eventDataPath}\n`)
  }

  async update(): Promise<number> {
    // if specified update only that asset
    if (this._selectedAsset) {
      await this._updateAsset(this._selectedAsset)
      return 1
    }

    // otherwise update all assets
    const assets = (await getDirsFromDir(this._assetsDirPath)) ?? []
    for (const asset of assets) {
      await this._updateAsset(asset.name)
    }

    return assets.length
  }
}
