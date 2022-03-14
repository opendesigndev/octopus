import { round } from '@avocode/octopus-common/dist/utils/common'

import convertColor from '../../utils/colors'
import SourceLayerSubText from '../source/source-layer-sub-text'

import type { Octopus } from '../../typings/octopus'

type OctopusSubTextOptions = {
  sourceLayer: SourceLayerSubText
}

export default class OctopusSubText {
  private _sourceLayer: SourceLayerSubText

  constructor(options: OctopusSubTextOptions) {
    this._sourceLayer = options.sourceLayer
  }

  private _parsePostScriptName(): string {
    return this._sourceLayer.baseFont.replace(/^.*\+/, '')
  }

  private _parseLetterSpacing(): number {
    const fontSize = this._sourceLayer.fontSize
    const textCharSpace = this._sourceLayer.textCharSpace

    return round(fontSize * textCharSpace, 2)
  }

  private _parseFont() {
    const postScriptName = this._parsePostScriptName()

    return { postScriptName }
  }

  private _parseFill(): Octopus['FillColor'] {
    const [r, g, b] = convertColor(
      this._sourceLayer.colorNonStroking ?? [0, 0, 0],
      this._sourceLayer.colorSpaceNonStroking ?? ''
    )

    return {
      type: 'COLOR' as const,
      color: { r, g, b, a: 1 },
    }
  }

  private _parseTextValue(): string {
    const stringOrArr = this._sourceLayer.value

    if (typeof stringOrArr === 'string') {
      return stringOrArr
    }

    return stringOrArr.filter((stringOrNum) => typeof stringOrNum === 'string').join('')
  }

  private _parseStyle(): Octopus['TextStyle'] {
    const font = this._parseFont()
    const fontSize = this._sourceLayer.fontSize
    const letterSpacing = this._parseLetterSpacing()

    return {
      font,
      fontSize,
      letterSpacing,
      fills: [this._parseFill()],
    }
  }

  convert(): Octopus['Text'] {
    const value = this._parseTextValue()
    const style = this._parseStyle()

    return {
      value,
      defaultStyle: style,
      baselinePolicy: 'SET',
      textTransform: this._sourceLayer.textTransformMatrix,
    }
  }
}
