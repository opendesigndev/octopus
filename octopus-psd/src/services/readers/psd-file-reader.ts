import { SourceDesign, SourceImage } from '../../entities/source/source-design'
import { parsePsd } from '@avocode/psd-parser'
import path from 'path'
import sizeOf from 'image-size'
import chalk from 'chalk'
import { displayPerf } from '../../utils/console'
import { getFilesFromDir, parseJsonFromFile } from '../../utils/files'
import type { RawArtboard } from '../../typings/raw'
import { logInfo } from '../instances/misc'

type PSDFileReaderOptions = {
  path: string
  designId: string
}

export class PSDFileReader {
  private _path: string
  private _designId: string
  private _sourceDesign: Promise<SourceDesign>

  static OUTPUT_DIR = 'workdir'
  static IMAGES_DIR = 'pictures'
  static RENDER_IMG = 'preview.png'
  static SOURCE_FILE = 'source.json'
  static PATTERNS_DIR = path.join(PSDFileReader.IMAGES_DIR, 'patterns')

  constructor(options: PSDFileReaderOptions) {
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

  get sourceDesign(): Promise<SourceDesign> {
    return this._sourceDesign
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

  private async _getSourceArtboard(): Promise<RawArtboard> {
    const timeParseStart = performance.now()
    await parsePsd(this.path, this._parsePsdOptions)
    const timeParse = performance.now() - timeParseStart
    logInfo(`Source file created in directory: ${chalk.yellow(this.designId)} ${displayPerf(timeParse)}`)

    const timeReadStart = performance.now()
    const artboard = await parseJsonFromFile<RawArtboard>(path.join(this._outDir, PSDFileReader.SOURCE_FILE))
    const timeRead = performance.now() - timeReadStart
    logInfo(`RawArtboard prepared ${displayPerf(timeRead)}`)

    return artboard
  }

  private async _getImages(): Promise<SourceImage[]> {
    const imagesPath = path.join(this._outDir, PSDFileReader.IMAGES_DIR)
    const images: SourceImage[] = ((await getFilesFromDir(imagesPath)) ?? []).map((image) => ({
      name: image.name,
      path: path.join(PSDFileReader.IMAGES_DIR, image.name),
    }))

    const patterns: SourceImage[] = []
    const patternsPath = path.join(this._outDir, PSDFileReader.PATTERNS_DIR)
    const patternsResults = (await getFilesFromDir(patternsPath)) ?? []
    for (const image of patternsResults) {
      const name = image.name
      const relativePath = path.join(PSDFileReader.PATTERNS_DIR, name)
      const imgPath = path.join(this._outDir, relativePath)
      const { width, height } = await sizeOf(imgPath)
      patterns.push({ name, path: relativePath, width, height })
    }

    return [...images, ...patterns]
  }

  private async _initSourceDesign(): Promise<SourceDesign> {
    const designId = this.designId
    const artboard = await this._getSourceArtboard()
    const images = await this._getImages()
    const sourceDesign = new SourceDesign({ designId, artboard, images })
    return sourceDesign
  }
}
