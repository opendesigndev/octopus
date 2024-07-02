import fsp from 'fs/promises'
import os from 'os'
import path from 'path'

import { JSONFromTypedArray } from '@opendesign/octopus-common/dist/utils/common.js'
import { v4 as uuidv4 } from 'uuid'

import { XDFileReaderCommon } from '../xd-file-reader-common.js'

import type { ArrayBufferEntry } from '../../../../../src/typings/index.js'

type XDFileReaderOptions = {
  /** Path to the .xd file. */
  path: string
  storeAssetsOnFs?: boolean
}

type NamedArtboard = {
  id: string
  name: string
}

export type DesignMeta = {
  designName: string
  content: {
    topLevelArtboards: NamedArtboard[]
    localComponents: NamedArtboard[]
    remoteComponents: NamedArtboard[]
  }
}

export class XDFileReader extends XDFileReaderCommon {
  private _storeAssetsOnFs: boolean
  private _tempAssetsLocation: Promise<string | null>
  protected _promisedData: Promise<Uint8Array>
  private _path: string

  constructor(options: XDFileReaderOptions) {
    super()
    this._path = options.path
    this._storeAssetsOnFs = options.storeAssetsOnFs ?? false
    this._tempAssetsLocation = this._initTempAssetsLocation()
  }

  protected async _getBuffer(): Promise<Uint8Array> {
    const buffer = await fsp.readFile(this._path)

    return new Uint8Array(buffer)
  }

  private async _initTempAssetsLocation() {
    if (!this._storeAssetsOnFs) return Promise.resolve(null)
    const tmpPath = path.join(os.tmpdir(), uuidv4())
    await fsp.mkdir(tmpPath, { recursive: true })
    return tmpPath
  }

  protected async _processImage(entry: ArrayBufferEntry) {
    const tmpPath = await this._tempAssetsLocation
    if (this._storeAssetsOnFs && typeof tmpPath === 'string') {
      const tmpFile = path.join(tmpPath, uuidv4())
      await fsp.writeFile(tmpFile, Buffer.from(entry.content))
      return {
        path: entry.path,
        getImageData: async () => {
          const buffer = await fsp.readFile(tmpFile)
          return new Uint8Array(buffer)
        },
      }
    }

    return {
      path: entry.path,
      getImageData: () => Promise.resolve(new Uint8Array(Buffer.from(entry.content))),
    }
  }

  protected _parseDecode(buf: Uint8Array): unknown {
    return JSONFromTypedArray(buf)
  }

  async cleanup(): Promise<void> {
    const tempDir = await this._tempAssetsLocation
    if (typeof tempDir === 'string') {
      await fsp.rm(tempDir, { recursive: true, force: true })
    }
    return
  }
}
