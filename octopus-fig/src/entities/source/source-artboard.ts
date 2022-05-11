import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import { createSourceLayer } from '../../factories/create-source-layer'
import { SourceBounds } from '../../typings/source'
import { getBoundsFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawArtboard, RawLayer } from '../../typings/raw'

export class SourceArtboard extends SourceEntity {
  protected _rawValue: RawArtboard
  private _layers: SourceLayer[]
  private _isPasteboard: boolean

  static DEFAULT_ID = 'artboard:1'

  constructor(raw: RawArtboard, isPasteboard?: boolean) {
    super(raw)
    this._layers = this._initLayers()
    this._isPasteboard = isPasteboard ?? false
  }

  private _initLayers() {
    const layers = asArray(this._rawValue?.children).reduce((layers: SourceLayer[], layer: RawLayer) => {
      const sourceLayer = createSourceLayer({
        layer,
        parent: this,
      })
      return sourceLayer ? push(layers, sourceLayer) : layers
    }, [])
    return layers
  }

  private _getArtboardAssetsImages(): string[] {
    return [] // TODO
    // const entries = traverseAndFind(this._rawValue, (obj: unknown) => {
    //   return Object(obj)?.style?.fill?.pattern?.meta?.ux?.uid
    // })
    // return [...new Set(entries)] as string[]
  }

  private _getArtboardAssetsFonts(): string[] {
    return [] // TODO
    // const entries = traverseAndFind(this._rawValue, (obj: unknown) => {
    //   return Object(obj)?.postscriptName
    // })
    // return [...new Set(entries)] as string[]
  }

  @firstCallMemo()
  get dependencies(): { images: string[]; fonts: string[] } {
    return {
      images: this._getArtboardAssetsImages(),
      fonts: this._getArtboardAssetsFonts(),
    }
  }

  get raw(): RawArtboard {
    return this._rawValue
  }

  get layers(): SourceLayer[] {
    return this._layers
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
}
