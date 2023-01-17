import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo'
import { traverseAndFind } from '@opendesign/octopus-common/dist/utils/common'
import { round } from '@opendesign/octopus-common/dist/utils/math'

import { createSourceLayer } from '../../factories/create-source-layer'
import { getBoundsFor } from '../../utils/source'
import { SourceEntity } from './source-entity'
import { SourceLayerContainer } from './source-layer-container'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { ImageMap } from '../../services/conversion/design-converter'
import type { RawBlendMode, RawLayer, RawLayerContainer } from '../../typings/raw'
import type { SourceBounds } from '../../typings/source'

type SourceComponentOptions = {
  rawFrame: RawLayer
  isPasteboard?: boolean
  imageSizeMap?: ImageMap
}

export class SourceComponent extends SourceEntity {
  protected _rawValue: RawLayer
  private _sourceLayer: SourceLayer
  private _isPasteboard: boolean
  private _imageMap: ImageMap

  static DEFAULT_ID = 'component-1'
  static DEFAULT_NAME = 'Component'

  constructor(options: SourceComponentOptions) {
    super(options.rawFrame)
    this._isPasteboard = options.isPasteboard ?? false
    this._imageMap = options.imageSizeMap ?? {}
    this._sourceLayer = this._initializeSourceLayer(options.rawFrame)
  }

  private _initializeSourceLayer(rawValue: RawLayer): SourceLayer {
    return (
      createSourceLayer({ parent: this, layer: rawValue }) ??
      new SourceLayerContainer({ rawValue: rawValue as RawLayerContainer, parent: this })
    )
  }

  get imageMap(): ImageMap {
    return this._imageMap
  }

  getImageSize(ref: string | undefined): { width: number; height: number } | undefined {
    return ref ? this.imageMap[ref]?.imageSize : undefined
  }

  getImageExportedPath(ref: string | undefined): string | undefined {
    return ref ? this.imageMap[ref]?.exportedPath : undefined
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
    return this._rawValue.id ?? SourceComponent.DEFAULT_ID
  }

  get name(): string {
    return this._rawValue.name ?? SourceComponent.DEFAULT_NAME
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
}
