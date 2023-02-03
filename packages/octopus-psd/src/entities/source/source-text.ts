import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import PROPS from '../../utils/prop-names.js'
import { getMatrixFor, getBoundsFor } from '../../utils/source.js'
import { getFontProperties } from '../../utils/text.js'
import { SourceEntity } from './source-entity.js'
import { SourceTextParagraphStyleRange } from './source-text-paragraph-style-range.js'
import { SourceTextTextStyleRange } from './source-text-text-style-range.js'

import type {
  RawEngineData,
  RawLayerText,
  RawParagraphStyleRange,
  RawTextProperties,
  RawTextStyleRange,
} from '../../typings/raw'
import type { SourceBounds, SourceMatrix } from '../../typings/source'

type TextStyleFromTo = { from: number; to: number; runArrayIndex: number }

export class SourceText extends SourceEntity {
  protected _engineData: RawEngineData | undefined
  protected _textProps: RawTextProperties | undefined

  protected _rawValue: RawLayerText

  static DEFAULT_ORIENTATION = 'horizontal' as const

  constructor(rawValue: RawLayerText) {
    super(rawValue)

    this._rawValue = rawValue
    this._engineData = rawValue.textProperties
    this._textProps = rawValue.layerProperties?.[PROPS.TYPE_TOOL_OBJECT_SETTING]
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

  private _getTextStyleFromTo(): TextStyleFromTo[] {
    const edges = this._getParagraphStyleRange().map(({ to }) => to)

    let currentEdge = edges.shift() ?? Infinity
    const parts: TextStyleFromTo[] = []

    const { RunLengthArray } = this._engineData?.EngineDict?.StyleRun ?? {}

    const runLengthArray = asArray(RunLengthArray)
    let position = 0

    runLengthArray.forEach((size, runArrayIndex) => {
      let from = position
      const to = position + size

      if (currentEdge > to) {
        parts.push({ from, to, runArrayIndex })
      } else {
        do {
          parts.push({ from, to: Math.min(to, currentEdge), runArrayIndex })
          from = currentEdge
          if (currentEdge >= to) {
            break
          }
          currentEdge = edges.shift() ?? Infinity
        } while (currentEdge < Infinity)
      }

      position = position + size
    })

    return parts
  }

  private _getTextStyleRange(): RawTextStyleRange[] {
    const textStyleFromTo = this._getTextStyleFromTo()
    const { ResourceDict } = this._engineData ?? {}
    const { FontSet, TheNormalStyleSheet } = ResourceDict ?? {}
    const { RunArray } = this._engineData?.EngineDict?.StyleRun ?? {}
    const resourceDictStyleSheet = ResourceDict?.StyleSheetSet?.[TheNormalStyleSheet ?? 0]
    const fontSet = asArray(FontSet)
    const runArray = asArray(RunArray)
    return textStyleFromTo.map(({ from, to, runArrayIndex }) => {
      const { StyleSheet } = runArray[runArrayIndex]
      return {
        from,
        to,
        textStyle: {
          ...StyleSheet?.StyleSheetData,
          ...getFontProperties(fontSet, StyleSheet?.StyleSheetData),
        },
        defaultStyleSheet: resourceDictStyleSheet?.StyleSheetData,
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

    let position = 0
    return runLengthArray.map((size, idx) => {
      const from = position
      const to = from + size
      position = position + size

      return {
        from,
        to,
        paragraphStyle: { ...runArray[idx].ParagraphSheet.Properties },
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
