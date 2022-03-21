import { asArray } from '@avocode/octopus-common/dist/utils/as'
import isEqual from 'lodash/isEqual'

import SourceLayerSubText from './source-layer-sub-text'
import SourceLayerCommon from './source-layer-common'

import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type { RawTextLayer } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'
import type { RawGraphicsState } from '../../typings/raw/graphics-state'

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
      console.error('initTexts', 'Different transform matrix in the same text group')
    }

    return textSubLayers
  }

  get texts(): Nullable<SourceLayerSubText[]> {
    return this._normalizedTexts
  }

  get graphicsState(): Nullable<RawGraphicsState> {
    return this._normalizedTexts[0].graphicsState
  }

  get name(): string {
    return SourceLayerText.DEFAULT_NAME
  }
}
