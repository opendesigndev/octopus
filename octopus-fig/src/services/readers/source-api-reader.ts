import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark'
import { v4 as uuidv4 } from 'uuid'

import { SourceDesign } from '../../entities/source/source-design'
import { displayPerf } from '../../utils/console'
import { parseJsonFromFile } from '../../utils/files'
import { logInfo } from '../instances/misc'

import type { SourceImage } from '../../entities/source/source-design'
import type { RawDesign } from '../../typings/raw'

type SourceApiReaderOptions = {
  path: string
  designId?: string
}

export class SourceApiReader {
  private _path: string
  private _designId: string
  private _sourceDesign: Promise<SourceDesign | null>

  constructor(options: SourceApiReaderOptions) {
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

  private async _getRawDesign(): Promise<RawDesign | null> {
    const { time, result } = await benchmarkAsync(() => parseJsonFromFile<RawDesign>(this.path))
    logInfo(`RawDesign prepared ${displayPerf(time)}`)
    return result
  }

  private async _getImages(): Promise<SourceImage[]> {
    return [] // TODO
  }

  private async _initSourceDesign(): Promise<SourceDesign | null> {
    const raw = await this._getRawDesign()
    if (raw == null) return null
    const images = await this._getImages()
    const designId = this.designId

    return new SourceDesign({ designId, images, raw })
  }
}
