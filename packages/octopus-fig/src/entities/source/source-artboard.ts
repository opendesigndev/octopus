import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { traverseAndFind } from '@opendesign/octopus-common/dist/utils/common.js'
import { round } from '@opendesign/octopus-common/dist/utils/math.js'

import { SourceEntity } from './source-entity.js'
import { SourceLayerContainer } from './source-layer-container.js'
import { createSourceLayer } from '../../factories/create-source-layer.js'
import { getBoundsFor } from '../../utils/source.js'

import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { RawBlendMode, RawLayer, RawLayerContainer, RawParentType } from '../../typings/raw/index.js'
import type { SourceBounds } from '../../typings/source.js'

type SourceArtboardOptions = {
  rawFrame: RawLayer
  isPasteboard?: boolean
}

export class SourceArtboard extends SourceEntity {
  declare _rawValue: RawLayer
  private _sourceLayer: SourceLayer
  private _isPasteboard: boolean

  static DEFAULT_ID = 'artboard-1'
  static DEFAULT_NAME = 'Artboard'

  constructor(options: SourceArtboardOptions) {
    super(options.rawFrame)
    this._isPasteboard = options.isPasteboard ?? false
    this._sourceLayer = this._initializeSourceLayer(options.rawFrame)
  }

  private _initializeSourceLayer(rawValue: RawLayer): SourceLayer {
    return (
      createSourceLayer({ parent: this, layer: rawValue }) ??
      new SourceLayerContainer({ rawValue: rawValue as RawLayerContainer, parent: this })
    )
  }

  private _getAssetFonts(): string[] {
    const entries = traverseAndFind(this._rawValue, (obj: unknown) => {
      const o = Object(obj)
      if (o?.fontPostScriptName) return o?.fontPostScriptName
      if (o?.fontPostScriptName === null && o?.fontFamily) return o?.fontFamily
    })
    return [...new Set(entries)] as string[]
  }

  @firstCallMemo()
  get dependencies(): { fonts: string[] } {
    return { fonts: this._getAssetFonts() }
  }

  get raw(): RawLayer {
    return this._rawValue
  }

  get sourceLayer(): SourceLayer {
    return this._sourceLayer
  }

  get bounds(): SourceBounds | null {
    return getBoundsFor(this._rawValue.absoluteRenderBounds)
  }

  get boundingBox(): SourceBounds | null {
    return getBoundsFor(this._rawValue.absoluteBoundingBox)
  }

  get id(): string {
    return this._rawValue.id ?? SourceArtboard.DEFAULT_ID
  }

  get name(): string {
    return this._rawValue.name ?? SourceArtboard.DEFAULT_NAME
  }

  get type(): 'ARTBOARD' {
    return 'ARTBOARD'
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

  get clipsContent(): boolean {
    return (this._rawValue as RawLayerContainer).clipsContent ?? true
  }

  get parentType(): RawParentType | undefined {
    return this._rawValue.parent?.type
  }
}