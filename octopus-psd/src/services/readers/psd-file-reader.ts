import path from 'path'

import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark'
import { displayPerf } from '@avocode/octopus-common/dist/utils/console'
import { parsePsd } from '@avocode/psd-parser'
import chalk from 'chalk'
import { imageSize } from 'image-size'
import rimraf from 'rimraf'
import { v4 as uuidv4 } from 'uuid'

import { SourceDesign } from '../../entities/source/source-design.js'
import { getFilesFromDir, parseJsonFromFile } from '../../utils/files.js'
import { logInfo } from '../instances/misc.js'

import type { SourceImage } from '../../entities/source/source-design.js'
import type { RawArtboard } from '../../typings/raw/index.js'

type PSDFileReaderOptions = {
  path: string
  designId?: string
}

export class PSDFileReader {
  private _path: string
  private _designId: string
  private _sourceDesign: Promise<SourceDesign | null>

  static OUTPUT_DIR = 'workdir'
  static IMAGES_DIR = 'pictures'
  static RENDER_IMG = 'preview.png'
  static SOURCE_FILE = 'source.json'
  static PATTERNS_DIR = path.join(PSDFileReader.IMAGES_DIR, 'patterns')

  constructor(options: PSDFileReaderOptions) {
    this._path = options.path
    this._designId = options.designId || uuidv4()
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

  async cleanup(): Promise<void> {
    return new Promise((resolve, reject) => {
      rimraf(this._outDir, (error: Error | null | undefined) => {
        error ? reject(error) : resolve()
      })
    })
  }

  private get _outDir() {
    return path.join(PSDFileReader.OUTPUT_DIR, this.designId)
  }

  private get _parsePsdOptions() {
    return {
      outDir: this._outDir,
      imagesSubfolder: PSDFileReader.IMAGES_DIR,
      previewPath: path.join(this._outDir, PSDFileReader.RENDER_IMG),
      octopusFileName: 'octopus-v2.json', // TODO remove in the end when octopus2 is not needed
    }
  }

  private async _getSourceArtboard(): Promise<RawArtboard | null> {
    const { time: timeParse } = await benchmarkAsync(() => parsePsd(this.path, this._parsePsdOptions))
    logInfo(`Source file created in directory: ${chalk.yellow(this.designId)} ${displayPerf(timeParse)}`)

    const { time: timeRead, result } = await benchmarkAsync(() =>
      parseJsonFromFile<RawArtboard>(path.join(this._outDir, PSDFileReader.SOURCE_FILE))
    )
    logInfo(`RawArtboard prepared ${displayPerf(timeRead)}`)

    return result
  }

  private async _getImages(): Promise<SourceImage[]> {
    const imagesPath = path.join(this._outDir, PSDFileReader.IMAGES_DIR)
    const images: SourceImage[] = ((await getFilesFromDir(imagesPath)) ?? []).map((image) => {
      const name = image.name
      const relativePath = path.join(PSDFileReader.IMAGES_DIR, name)
      const imgPath = path.join(this._outDir, relativePath)
      return { name, path: imgPath }
    })

    const patterns: SourceImage[] = []
    const patternsPath = path.join(this._outDir, PSDFileReader.PATTERNS_DIR)
    const patternsResults = (await getFilesFromDir(patternsPath)) ?? []
    for (const image of patternsResults) {
      const name = image.name
      const relativePath = path.join(PSDFileReader.PATTERNS_DIR, name)
      const imgPath = path.join(this._outDir, relativePath)
      const { width, height } = await imageSize(imgPath)
      patterns.push({ name, path: imgPath, width, height })
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
