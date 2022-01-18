import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { Octopus } from '../../typings/octopus'
import type { SourceLayerText } from '../source/source-layer-text'

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

  get textValue() {
    return this._sourceLayer.text.textKey
  }

  get text(): Octopus['Text'] | null {
    const value = this.textValue
    if (typeof value !== 'string') return null
    const defaultStyle = {} // this._getDefaultStyle() // TODO
    if (!defaultStyle) return null
    const parseTextTransform = {} as Octopus['TextTransform'] // this._getTextTransform() // TODO
    if (!parseTextTransform) return null
    const styles = [] as Octopus['StyleRange'][] // this._getStyles(value) // TODO
    const frame = {} as Octopus['TextFrame'] // this._getFrame() // TODO
    const horizontalAlign = 'LEFT' // this._getHorizontalAlign() // TODO

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

  private _convertTypeSpecific(): LayerSpecifics<Octopus['TextLayer']> | null {
    const text = this.text
    if (!text) return null

    return {
      type: 'TEXT',
      text,
    } as const
  }

  convert(): Octopus['TextLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return {
      ...common,
      ...specific,
    }
  }
}
