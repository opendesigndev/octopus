import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { round } from '@opendesign/octopus-common/dist/utils/math.js'

import { DEFAULTS } from '../../utils/defaults.js'
import PROPS from '../../utils/prop-names.js'
import { getArtboardColor, getBoundsFor, getLayerBounds } from '../../utils/source.js'
import { SourceComponent } from './source-component.js'
import { SourceLayerEffects } from './source-effects-layer.js'
import { SourceEntity } from './source-entity.js'
import { SourcePath } from './source-path.js'

import type { RawLayerProperties, RawNodeChildWithType, RawBounds, RawColor } from '../../typings/raw'
import type { SourceDocumentDimensions, SourceBounds, SourceColor } from '../../typings/source'
import type BLEND_MODES from '../../utils/blend-modes.js'
import type { SourceLayerSection } from './source-layer-section'
import type { MaskData, RealMaskData } from '@webtoon/psd-ts/dist/sections/index.js'

export type SourceLayerParent = SourceComponent | SourceLayerSection

export type SourceLayerType =
  | 'backgroundLayer'
  | 'layerSection'
  | 'shapeLayer'
  | 'textLayer'
  | 'layer'
  | 'adjustmentLayer'

type SourceLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawNodeChildWithType
}

export class SourceLayerCommon extends SourceEntity {
  protected _parent: SourceLayerParent
  protected _rawValue: RawNodeChildWithType

  static OPACITY_DEFAULT_VALUE = 255

  constructor(options: SourceLayerOptions) {
    super(options.rawValue)
    this._parent = options.parent
  }

  private get _layerProperties(): RawLayerProperties | undefined {
    return this._rawValue.layerProperties
  }

  get type(): SourceLayerType | undefined {
    return this._rawValue?.addedType
  }

  get id(): string | undefined {
    const id = this._layerProperties?.lyid
    return id ? String(id) : undefined
  }

  get name(): string | undefined {
    return this._rawValue.name
  }

  get parent(): SourceLayerParent {
    return this._parent
  }

  get parentComponent(): SourceComponent {
    const parent = this._parent
    return parent instanceof SourceComponent ? parent : parent.parentComponent
  }

  get artboardColor(): SourceColor | null {
    return getArtboardColor(this.artboardBackgroundType, this.rawArtboardColor)
  }

  get artboardBackgroundType(): number | undefined {
    return this._layerProperties?.[PROPS.ARTBOARD_DATA]?.artboardBackgroundType
  }

  get rawArtboardColor(): RawColor | undefined {
    return this._layerProperties?.[PROPS.ARTBOARD_DATA]?.Clr
  }

  get isArtboard(): boolean {
    return Boolean(this._rawValue.layerProperties?.[PROPS.ARTBOARD_DATA])
  }

  get visible(): boolean {
    return !this._rawValue.isHidden ?? true
  }

  get bounds(): SourceBounds {
    return this._rawArtboardBounds ? getBoundsFor(this._rawArtboardBounds) : getLayerBounds(this._rawValue)
  }

  private get _rawArtboardBounds(): RawBounds | undefined {
    return this._layerProperties?.[PROPS.ARTBOARD_DATA]?.artboardRect
  }

  get opacity(): number {
    return round((this._rawValue.opacity ?? SourceLayerCommon.OPACITY_DEFAULT_VALUE) / DEFAULTS.RGB_COLOR_MAX_VALUE)
  }

  get fillOpacity(): number {
    const rawOpacity = this._layerProperties?.iOpa?.fillOpacity
    return round((rawOpacity ?? SourceLayerCommon.OPACITY_DEFAULT_VALUE) / DEFAULTS.RGB_COLOR_MAX_VALUE)
  }

  get blendMode(): keyof typeof BLEND_MODES | undefined {
    return (
      this._rawValue.layerProperties?.[PROPS.SECTION_DIVIDER_SETTING]?.blendMode ??
      this._rawValue.layerProperties?.[PROPS.NESTED_SECTION_DIVIDER_SETTING]?.blendMode ??
      this._rawValue.blendMode
    )
  }

  get clipped(): boolean {
    return Boolean(this._rawValue.clipping)
  }

  get imageName(): string | undefined {
    return `${this.id}.png`
  }

  private get _maskData(): MaskData | RealMaskData | undefined {
    if (!('maskData' in this._rawValue)) {
      return
    }

    if (this._rawValue.maskData?.flags.userMaskFromRenderingOtherData === true) {
      return this._rawValue.maskData.realData
    }

    return this._rawValue.maskData
  }

  @firstCallMemo()
  get layerEffects(): SourceLayerEffects {
    return new SourceLayerEffects(this._rawValue)
  }

  get bitmapMask(): string | undefined {
    const maskData = this._maskData

    if (!maskData) {
      return
    }

    const { top, left, bottom, right } = maskData
    const height = bottom - top
    const width = right - left

    if (width <= 0 || height <= 0) {
      return
    }

    return `${this.id}_user_mask.png`
  }

  get documentWidth(): number {
    return this._parent.documentWidth
  }

  get documentHeight(): number {
    return this._parent.documentHeight
  }

  get documentDimensions(): SourceDocumentDimensions {
    return {
      width: this.documentWidth,
      height: this.documentHeight,
    }
  }

  @firstCallMemo()
  get path(): SourcePath | undefined {
    const vectorMaskSetting =
      this._rawValue?.layerProperties?.[PROPS.VECTOR_MASK_SETTING1] ??
      this._rawValue?.layerProperties?.[PROPS.VECTOR_MASK_SETTING2]

    if (vectorMaskSetting)
      return new SourcePath({
        vectorOriginationData: this._rawValue.layerProperties?.vogk,
        vectorMaskSetting,
        documentDimensions: this.documentDimensions,
      })
  }
}
