import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { Octopus } from '../../typings/octopus'
import type { SourceLayerText } from '../source/source-layer-text'
import type { SourceText } from '../source/source-text'
import type { SourceTextStyleRange } from '../source/source-text-style-range'
import { SourceTextStyle } from '../source/source-text-style'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerText
}

export class OctopusLayerText extends OctopusLayerCommon {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerText

  constructor(options: OctopusLayerTextOptions) {
    super(options)
  }

  get textValue(): string {
    return this._sourceLayer.text.textKey
  }

  get sourceText(): SourceText {
    return this._sourceLayer.text
  }
  private _getFont(textStyle: SourceTextStyle): Octopus['StyleRange']['style']['font'] {
    return {
      postScriptName: textStyle.fontPostScriptName,
      family: textStyle.fontName,
      style: textStyle.fontStyleName,
    }
  }

  private _getStyle(styleRange: SourceTextStyleRange): Octopus['StyleRange'] {
    const { from, to, textStyle } = styleRange
    const ranges = [{ from, to }] // TODO add optimization to merge same styles
    const style = {
      font: this._getFont(textStyle),
    } as Octopus['StyleRange']['style']
    return { ranges, style }
  }

  private _getStyles(styles: SourceTextStyleRange[]): Octopus['StyleRange'][] {
    return styles.map((style) => this._getStyle(style))
  }

  get text(): Octopus['Text'] | null {
    const value = this.textValue
    const defaultStyle = {} // this._getDefaultStyle() // TODO
    if (!defaultStyle) return null
    const styles = this._getStyles(this.sourceText.textStyles)
    // const frame = {} as Octopus['TextFrame'] // this._getFrame() // TODO

    return {
      value,
      defaultStyle,
      baselinePolicy: 'SET',
      styles,
      // frame,
    }
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['TextLayer']> | null {
    const text = this.text
    if (!text) return null
    return { type: 'TEXT', text } as const
  }

  convert(): Octopus['TextLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
