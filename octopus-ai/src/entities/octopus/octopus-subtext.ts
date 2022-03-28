import { round } from '@avocode/octopus-common/dist/utils/math'

import SourceLayerSubText from '../source/source-layer-sub-text'
import OctopusEffectColorFill, { ColorSpace } from './octopus-effect-color-fill'

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

  private _parseStyle(): Octopus['TextStyle'] {
    const font = this._parseFont()
    const fontSize = this._sourceLayer.fontSize
    const letterSpacing = this._parseLetterSpacing()

    const fill = new OctopusEffectColorFill({
      sourceLayer: this._sourceLayer,
      colorSpaceType: ColorSpace.NON_STROKING,
      colorSpaceValue: this._sourceLayer.colorSpaceNonStroking ?? '',
    }).convert()

    return {
      font,
      fontSize,
      letterSpacing,
      fills: [fill],
    }
  }

  convert(): Octopus['Text'] {
    const value = this._sourceLayer.value
    const style = this._parseStyle()

    return {
      value,
      defaultStyle: style,
      baselinePolicy: 'SET',
      textTransform: this._sourceLayer.textTransformMatrix,
    }
  }
}
