import path from 'path'

import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark'
import sizeOf from 'image-size'

import { SourceDesign } from '../../entities/source/source-design'
import { displayPerf } from '../../utils/console'
import { parseJsonFromFile, getFilesFromDir } from '../../utils/files'
import { logInfo } from '../instances/misc'

import type { SourceImage } from '../../entities/source/source-design'
import type { RawArtboard } from '../../typings/raw'

type SourceFileReaderOptions = {
  path: string
  designId: string
}

export class SourceFileReader {
  private _path: string
  private _designId: string
  private _sourceDesign: Promise<SourceDesign | null>

  static IMAGES_DIR = 'pictures'
  static SOURCE_FILE = 'source.json'
  static PATTERNS_DIR = path.join(SourceFileReader.IMAGES_DIR, 'patterns')

  constructor(options: SourceFileReaderOptions) {
    this._path = options.path
    this._designId = options.designId
    this._sourceDesign = this._initSourceDesign()
  }

  get path(): string {
    return this._path
  }

  get designId(): string {
    return this._designId
  }

  get sourceDesign(): Promise<SourceDesign | null> {
    return this._sourceDesign
  }

  private async _getSourceArtboard(): Promise<RawArtboard | null> {
    const { time: timeRead, result } = await benchmarkAsync(() =>
      parseJsonFromFile<RawArtboard>(path.join(this.path, SourceFileReader.SOURCE_FILE))
    )
    logInfo(`RawArtboard prepared ${displayPerf(timeRead)}`)

    return result
  }

  private async _getImages(): Promise<SourceImage[]> {
    const imagesPath = path.join(this.path, SourceFileReader.IMAGES_DIR)
    const images: SourceImage[] = ((await getFilesFromDir(imagesPath)) ?? []).map((image) => {
      const name = image.name
      const relativePath = path.join(SourceFileReader.IMAGES_DIR, name)
      const imgPath = path.join(this.path, relativePath)
      return { name, path: imgPath, relativePath }
    })

    const patterns: SourceImage[] = []
    const patternsPath = path.join(this.path, SourceFileReader.PATTERNS_DIR)
    const patternsResults = (await getFilesFromDir(patternsPath)) ?? []
    for (const image of patternsResults) {
      const name = image.name
      const relativePath = path.join(SourceFileReader.PATTERNS_DIR, name)
      const imgPath = path.join(this.path, relativePath)
      const { width, height } = await sizeOf(imgPath)
      patterns.push({ name, path: imgPath, relativePath, width, height })
    }

    return [...images, ...patterns]
  }

  private async _initSourceDesign(): Promise<SourceDesign | null> {
    const designId = this.designId
    const artboard = await this._getSourceArtboard()
    if (artboard == null) return null
    const images = await this._getImages()

    const sourceDesign = new SourceDesign({ designId, artboard, images })
    return sourceDesign
  }
}
