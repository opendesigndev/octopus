import { asArray } from '@opendesign/octopus-common/dist/utils/as'
import isEqual from 'lodash/isEqual'

import { logger } from '../../services/instances/logger'
import { initSourceLayerChildren } from '../../utils/layer'
import { createSoftMask, initClippingMask } from '../../utils/mask'
import { SourceLayerCommon } from './source-layer-common'
import { SourceLayerSubText } from './source-layer-sub-text'

import type { RawTextLayer } from '../../typings/raw'
import type { RawGraphicsState } from '../../typings/raw/graphics-state'
import type { SourceLayerParent } from './source-layer-common'
import type { SourceLayerShape } from './source-layer-shape'
import type { SourceLayerXObjectForm } from './source-layer-x-object-form'
import type { Nullish } from '@opendesign/octopus-common/dist/utils/utility-types'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawTextLayer
}

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawTextLayer
  private _normalizedTexts: SourceLayerSubText[]
  private _clippingPaths: SourceLayerShape[] | null
  private _mask: Nullish<SourceLayerShape>
  private _softMask: Nullish<SourceLayerXObjectForm>

  static DEFAULT_NAME = '<TextLayer>'

  constructor(options: SourceLayerTextOptions) {
    super(options)
    this._normalizedTexts = this._initTexts()
    this._clippingPaths = this._initClippingPaths()
    this._softMask = this._initSoftMask()
    this._mask = this._initMask()
  }

  private _initTexts() {
    const textSubLayers = asArray(
      this._rawValue?.Texts?.map(
        (text) =>
          new SourceLayerSubText({
            rawValue: text,
            parent: this,
          })
      )
    )

    const equalDescendantMatrices = textSubLayers.every((textSubLayer) => {
      return isEqual(textSubLayer.textTransformMatrix, textSubLayers[0].textTransformMatrix)
    })

    if (!equalDescendantMatrices) {
      logger.error('Different transform matrix in the same text group')
    }

    return textSubLayers
  }

  private _initClippingPaths(): SourceLayerShape[] {
    return initSourceLayerChildren({
      parent: this._parent,
      layers: this._clippingPath ?? [],
    }) as SourceLayerShape[]
  }

  private _initMask(): Nullish<SourceLayerShape> {
    if (this.softMask) {
      return null
    }

    const mask = initClippingMask(this)

    if (!mask) {
      return null
    }

    return mask
  }

  get texts(): Nullish<SourceLayerSubText[]> {
    return this._normalizedTexts
  }

  get graphicsState(): Nullish<RawGraphicsState> {
    return this._normalizedTexts[0].graphicsState
  }

  get name(): string {
    return SourceLayerText.DEFAULT_NAME
  }

  private get _clippingPath(): Nullish<RawGraphicsState['ClippingPath']> {
    return this.graphicsState?.ClippingPath
  }

  get clippingPaths(): SourceLayerShape[] | null {
    return this._clippingPaths
  }

  get mask(): Nullish<SourceLayerShape> {
    return this._mask
  }

  private _initSoftMask(): Nullish<SourceLayerXObjectForm> {
    return createSoftMask({ sMask: this.sMask, parent: this._parent })
  }

  get textValue(): string {
    return this.texts?.map((text) => text.value).join('') ?? ''
  }

  get softMask(): Nullish<SourceLayerXObjectForm> {
    return this._softMask
  }
}