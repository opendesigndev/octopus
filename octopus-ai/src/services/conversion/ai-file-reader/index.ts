import { readFile, readdir } from 'fs/promises'

import SourceDesign from '../../../entities/source/source-design'

import type { SourceTree, SourceImage } from '../../../typings'
import type { RawSource, RawMetadata } from '../../../typings/raw'

type AIFileReaderOptions = {
  path: string
}

export class AIFileReader {
  static SOURCE_FILE = 'source.json'
  static METADATA_FILE = 'metadata.json'
  static IMAGE_DIR = 'bitmaps'

  private _path: string
  private _sourceDesign: Promise<SourceDesign>

  constructor(options: AIFileReaderOptions) {
    this._path = options.path
    this._sourceDesign = this._initSourceDesign(options.path)
  }

  async _initSourceDesign(dirPath: string): Promise<SourceDesign> {
    return this._fromSourceTree(await this._createSourceTree(dirPath))
  }

  private async _getRawJSON<T>(path: string): Promise<T | null> {
    try {
      const fileContent = await readFile(path, 'utf-8')
      return JSON.parse(fileContent) as T
    } catch (_) {
      //@todo use logger
      console.error('Failed to read:', path)
      return null
    }
  }

  private async _loadImages(dirPath: string): Promise<Promise<SourceImage>[]> {
    let imagePaths
    try {
      imagePaths = await readdir(dirPath + '/bitmaps')
    } catch (_) {
      //@todo use logger
      console.error('Failed to read image dir:', dirPath)
      return []
    }

    return imagePaths
      .map(async (id) => {
        const path = `${dirPath}/${AIFileReader.IMAGE_DIR}/${id}`
        try {
          return {
            id,
            rawValue: Buffer.from(await readFile(path)),
          }
        } catch (_) {
          //@todo use logger
          console.error('Failed to read image:', path)
          return null
        }
      })
      .filter((img) => !!img) as Promise<SourceImage>[]
  }

  private async _createSourceTree(dirPath: string): Promise<SourceTree> {
    const source = await this._getRawJSON<RawSource>(`${dirPath}/${AIFileReader.SOURCE_FILE}`)
    const metadata = await this._getRawJSON<RawMetadata>(`${dirPath}/${AIFileReader.METADATA_FILE}`)

    const images = await Promise.all(await this._loadImages(dirPath))
    const artboards = source?.Root?.Pages?.Kids ?? []
    const ocProperties = source?.Root?.OCProperties

    if (!source) {
      throw new Error('Missing source from source design')
    }

    if (!ocProperties) {
      throw new Error('Missing OC Properties from source design')
    }

    if (!metadata) {
      throw new Error('Missing metada from file input')
    }

    if (!artboards?.length) {
      throw new Error('Missing artboards from source design')
    }

    return {
      source,
      metadata,
      images,
      artboards,
      ocProperties,
    }
  }

  private _fromSourceTree(sourceTree: SourceTree): SourceDesign | never {
    return new SourceDesign(sourceTree)
  }

  get sourceDesign(): Promise<SourceDesign> {
    return this._sourceDesign
  }
}
