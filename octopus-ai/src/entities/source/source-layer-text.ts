import { asArray } from '@avocode/octopus-common/dist/utils/as'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import isEqual from 'lodash/isEqual'

import { logger } from '../../services/instances/logger'
import type { RawTextLayer } from '../../typings/raw'
import type { RawGraphicsState } from '../../typings/raw/graphics-state'
import type { SourceLayerParent } from './source-layer-common'
import SourceLayerCommon from './source-layer-common'
import SourceLayerSubText from './source-layer-sub-text'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawTextLayer
  path: number[]
}

export default class SourceLayerText extends SourceLayerCommon {
  static DEFAULT_NAME = '<TextLayer>'

  protected _rawValue: RawTextLayer
  private _normalizedTexts: SourceLayerSubText[]

  constructor(options: SourceLayerTextOptions) {
    super(options)
    this._normalizedTexts = this._initTexts()
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
      logger.warn('initTexts', 'Different transform matrix in the same text group')
    }

    return textSubLayers
  }

  get texts(): Nullable<SourceLayerSubText[]> {
    return this._normalizedTexts
  }

  get textValue(): string {
    return this.texts?.map((text) => text.value).join('') ?? ''
  }

  get graphicsState(): Nullable<RawGraphicsState> {
    return this._normalizedTexts[0].graphicsState
  }

  get name(): string {
    return SourceLayerText.DEFAULT_NAME
  }
}
