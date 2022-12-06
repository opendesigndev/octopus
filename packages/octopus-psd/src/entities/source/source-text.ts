import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import { getMatrixFor, getBoundsFor } from '../../utils/source.js'
import { getFontProperties } from '../../utils/text.js'
import { SourceEntity } from './source-entity.js'
import { SourceTextParagraphStyleRange } from './source-text-paragraph-style-range.js'
import { SourceTextTextStyleRange } from './source-text-text-style-range.js'

import type {
  EngineData,
  RawLayerText,
  RawParagraphStyleRange,
  RawTextProperties,
  RawTextStyleRange,
} from '../../typings/raw'
import type { SourceBounds, SourceMatrix } from '../../typings/source'

export class SourceText extends SourceEntity {
  protected _engineData: EngineData | undefined
  protected _textProps: RawTextProperties | undefined

  protected _rawValue: RawLayerText

  static DEFAULT_ORIENTATION = 'horizontal' as const

  constructor(rawValue: RawLayerText) {
    super(rawValue)

    this._rawValue = rawValue
    this._engineData = rawValue.textProperties
    this._textProps = rawValue.parsedProperties?.TySh
  }

  get textKey(): string {
    //keeping this for reference. its not quite clear which value
    // should be used. textData.Txt has no newline char.
    //    return this._rawValue.text ?? ''
    return this._textProps?.textData?.Txt ?? ''
  }

  get transform(): SourceMatrix {
    const matrix = {
      xx: this._textProps?.transformXX,
      xy: this._textProps?.transformXY,
      yx: this._textProps?.transformYX,
      yy: this._textProps?.transformYY,
      tx: this._textProps?.transformTX,
      ty: this._textProps?.transformTY,
    }
    return getMatrixFor(matrix)
  }

  private _getTextStyleRange(): RawTextStyleRange[] {
    const { ResourceDict } = this._engineData ?? {}
    const { FontSet } = ResourceDict ?? {}
    const { RunArray, RunLengthArray } = this._engineData?.EngineDict?.StyleRun ?? {}

    const fontSet = asArray(FontSet)
    const runArray = asArray(RunArray)
    const runLengthArray = asArray(RunLengthArray)

    return runArray.map(({ StyleSheet }, idx) => {
      const from = runLengthArray[idx - 1] ?? 0
      const toOrAddition = runLengthArray[idx] ?? 0
      const to = toOrAddition < from ? from + toOrAddition : toOrAddition

      return {
        from,
        to,
        textStyle: {
          ...StyleSheet?.StyleSheetData,
          ...getFontProperties(fontSet, StyleSheet?.StyleSheetData),
        },
      }
    })
  }

  @firstCallMemo()
  get textStyles(): SourceTextTextStyleRange[] {
    const textStyleRangePsd = this._getTextStyleRange()

    return textStyleRangePsd.map((range) => new SourceTextTextStyleRange(range))
  }

  private _getParagraphStyleRange(): RawParagraphStyleRange[] {
    const { RunArray, RunLengthArray } = this._engineData?.EngineDict?.ParagraphRun ?? {}

    const runArray = asArray(RunArray)
    const runLengthArray = asArray(RunLengthArray)

    return runArray.map(({ ParagraphSheet }, idx) => {
      const from = runLengthArray[idx - 1] ?? 0
      const toOrAddition = runLengthArray[idx] ?? 0
      const to = toOrAddition < from ? from + toOrAddition : toOrAddition

      return {
        from,
        to,
        paragraphStyle: { ...ParagraphSheet.Properties },
      }
    })
  }

  @firstCallMemo()
  get paragraphStyles(): SourceTextParagraphStyleRange[] {
    const ranges = this._getParagraphStyleRange()
    return ranges.map((range) => new SourceTextParagraphStyleRange(range))
  }

  get bounds(): SourceBounds | undefined {
    return this._textProps?.textData?.bounds ? getBoundsFor(this._textProps?.textData?.bounds) : undefined
  }

  get boundingBox(): SourceBounds | undefined {
    return this._textProps?.textData?.boundingBox ? getBoundsFor(this._textProps?.textData?.boundingBox) : undefined
  }
}
