/* eslint-disable @typescript-eslint/ban-ts-comment */
import OctopusLayerCommon from './octopus-layer-common'
// import { RawTextLayerText } from '../../typings/source'
// import type SourceLayerNormalizedText from '../source/source-layer-text-normalized'

import type { Octopus } from '../../typings/octopus'
import type SourceLayerText from '../source/source-layer-text'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { LayerSpecifics } from './octopus-layer-common'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerText
}

export default class OctopusLayerText extends OctopusLayerCommon {
  protected _sourceLayer: SourceLayerText

  constructor(options: OctopusLayerTextOptions) {
    super(options)
  }

  // private _parseFontSize(text: RawTextLayerText) {
  //   return text
  // }
  // private _parseFont(text: SourceLayerNormalizedText) {}

  // private _parseText(text: SourceLayerNormalizedText) {
  //   const artboardResources = this.parent.resources
  //   const font = this._parseFont(text)
  // }

  // private _getTexts() {
  //   const texts = this._sourceLayer.texts.map((text) => this._parseText(text))
  // }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['TextLayer']> | null {
    const textValue = this._sourceLayer.textValue
    const name = this._sourceLayer.name

    if (!textValue) return null
    return {
      type: 'TEXT',
      // @ts-ignore
      text: {
        value: textValue,
      },
      name,
    }
  }

  //@ts-ignore
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
