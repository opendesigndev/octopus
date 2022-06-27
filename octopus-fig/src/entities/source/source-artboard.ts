import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { traverseAndFind } from '@avocode/octopus-common/dist/utils/common'
import { round } from '@avocode/octopus-common/dist/utils/math'

import { getBoundsFor } from '../../utils/source'
import { SourceEntity } from './source-entity'
import { SourceLayerFrame } from './source-layer-frame'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawArtboard, RawBlendMode } from '../../typings/raw'
import type { SourceBounds } from '../../typings/source'

type SourceArtboardOptions = {
  rawArtboard: RawArtboard
  isPasteboard?: boolean
}

export class SourceArtboard extends SourceEntity {
  protected _rawValue: RawArtboard
  private _sourceFrame: SourceLayerFrame
  private _isPasteboard: boolean

  static DEFAULT_ID = 'artboard-1'

  constructor(options: SourceArtboardOptions) {
    super(options.rawArtboard)
    this._sourceFrame = new SourceLayerFrame({ rawValue: options.rawArtboard, parent: this })
    this._isPasteboard = options.isPasteboard ?? false
  }

  private _getArtboardAssetsFonts(): string[] {
    const entries = traverseAndFind(this._rawValue, (obj: unknown) => Object(obj)?.fontPostScriptName)
    return [...new Set(entries)] as string[]
  }

  @firstCallMemo()
  get dependencies(): { fonts: string[] } {
    return { fonts: this._getArtboardAssetsFonts() }
  }

  get raw(): RawArtboard {
    return this._rawValue
  }

  get sourceFrame(): SourceLayerFrame {
    return this._sourceFrame
  }

  get layers(): SourceLayer[] {
    return this.sourceFrame.layers
  }

  get bounds(): SourceBounds | null {
    return getBoundsFor(this._rawValue.absoluteBoundingBox)
  }

  get id(): string {
    return this._rawValue.id ?? SourceArtboard.DEFAULT_ID
  }

  get name(): string {
    return this._rawValue.name ?? SourceArtboard.DEFAULT_ID
  }

  get isPasteboard(): boolean {
    return this._isPasteboard
  }

  get opacity(): number {
    return round(this._rawValue.opacity ?? 1)
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue.blendMode
  }
}
