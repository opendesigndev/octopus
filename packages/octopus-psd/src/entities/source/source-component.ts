import { asArray, asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { push } from '@opendesign/octopus-common/dist/utils/common.js'

import { createSourceLayer } from '../../factories/create-source-layer.js'
import PROPS from '../../utils/prop-names.js'
import { getArtboardColor, getBoundsFor, getLayerBounds } from '../../utils/source.js'
import { SourceEntity } from './source-entity.js'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { RawNodeChildWithProps, RawParsedPsd, RawColor } from '../../typings/raw'
import type { SourceBounds, SourceColor } from '../../typings/source'
import type { SourceDesign } from './source-design.js'

export type SourceComponentOptions = {
  isPasteboard?: boolean
  raw: RawParsedPsd | RawNodeChildWithProps
  parent: SourceDesign
}

export class SourceComponent extends SourceEntity {
  protected _rawValue: RawNodeChildWithProps | RawParsedPsd
  private _layers: SourceLayer[]
  private _isPasteboard: boolean
  private _parent: SourceDesign

  static DEFAULT_ID = 'pasteboard-1'
  static DEFAULT_NAME = 'Pasteboard'
  static RAW_SOURCE_DEFAULT_NAME = 'ROOT'

  constructor({ isPasteboard, raw, parent }: SourceComponentOptions) {
    super(raw)
    this._layers = this._initLayers()
    this._isPasteboard = isPasteboard ?? false
    this._parent = parent
  }

  private _initLayers() {
    const layers = asArray(this._rawValue?.children).reduce((layers: SourceLayer[], layer) => {
      const sourceLayer = createSourceLayer({
        layer: layer as unknown as RawNodeChildWithProps,
        parent: this,
      })
      return sourceLayer ? push(layers, sourceLayer) : layers
    }, [])
    return layers
  }

  get raw(): RawNodeChildWithProps | RawParsedPsd {
    return this._rawValue
  }

  get layers(): SourceLayer[] {
    return this._layers
  }

  get bounds(): SourceBounds {
    const artboardRect = this._rawValue.layerProperties?.[PROPS.ARTBOARD_DATA]?.artboardRect

    if (artboardRect) {
      return getBoundsFor(artboardRect)
    }

    if (this._rawValue?.type === 'Psd') {
      return getBoundsFor({ Rght: this._rawValue?.width, Btom: this._rawValue?.height })
    }

    return getLayerBounds(this._rawValue)
  }

  get id(): string {
    return this._rawValue?.layerProperties?.[PROPS.LAYER_ID] !== undefined
      ? String(this._rawValue.layerProperties?.[PROPS.LAYER_ID])
      : SourceComponent.DEFAULT_ID
  }

  get name(): string {
    const rawName = this._rawValue.name
    return rawName !== undefined && rawName !== SourceComponent.RAW_SOURCE_DEFAULT_NAME
      ? String(this._rawValue.name)
      : SourceComponent.DEFAULT_NAME
  }

  get isPasteboard(): boolean {
    return this._isPasteboard
  }

  get isArtboard(): boolean {
    return Boolean(this._rawValue?.layerProperties?.[PROPS.ARTBOARD_DATA])
  }

  get artboardColor(): SourceColor | null {
    return getArtboardColor(this.artboardBackgroundType, this.rawArtboardColor)
  }

  get artboardBackgroundType(): number | undefined {
    return this._rawValue?.layerProperties?.[PROPS.ARTBOARD_DATA]?.artboardBackgroundType
  }

  get rawArtboardColor(): RawColor | undefined {
    return this._rawValue?.layerProperties?.[PROPS.ARTBOARD_DATA]?.[PROPS.COLOR]
  }

  get globalLightAngle(): number {
    if ('globalLightAngle' in this._rawValue) {
      return asFiniteNumber(this._rawValue.globalLightAngle, 0)
    }

    return 0
  }

  get documentWidth(): number {
    return this._parent.documentWidth
  }

  get documentHeight(): number {
    return this._parent.documentHeight
  }
}
