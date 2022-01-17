import { OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { Octopus } from '../../typings/octopus'
import { SourceLayerText } from '../source/source-layer-text'
import { RawLayerText } from '../../typings/source'
import { runInThisContext } from 'vm'

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

  _getTextValue() {
    return this._sourceLayer.text.textKey
  }

  _getText(): Octopus['Text'] | null {
    const value = this._getTextValue()
    if (typeof value !== 'string') return null
    const defaultStyle = {} // this._getDefaultStyle() // TODO
    if (!defaultStyle) return null
    const parseTextTransform = {} as Octopus['TextTransform'] // this._getTextTransform() // TODO
    if (!parseTextTransform) return null
    const styles = [] as Octopus['StyleRange'][] // this._getStyles(value) // TODO
    const frame = {} as Octopus['TextFrame'] // this._getFrame() // TODO
    const horizontalAlign = 'LEFT' // this._getHorizontalAlign()
    // const horizontalAlign = this._getHorizontalAlign()

    return {
      value,
      defaultStyle,
      baselinePolicy: 'SET',
      textTransform: parseTextTransform,
      ...(styles.length ? { styles } : null),
      frame,
      horizontalAlign,
      // verticalAlign?: 'TOP' | 'CENTER' | 'BOTTOM'
    }
  }

  /**
   * @TODOs
   * Guard with correct return type
   * @returns
   */
  convertTypeSpecific() {
    const text = this._getText()
    if (!text) return null

    return { text }
  }

  convert(): Octopus['TextLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    const specific = this.convertTypeSpecific()
    if (!specific) return null

    return {
      ...common,
      ...specific,
    }
  }
}
