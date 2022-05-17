import { OctopusLayerBase } from './octopus-layer-base'

import type { Octopus } from '../../typings/octopus'
import type { SourceLayerText } from '../source/source-layer-text'
import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base'

type OctopusLayerTextOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerText
}

export class OctopusLayerText extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerText

  constructor(options: OctopusLayerTextOptions) {
    super(options)
  }

  private get _text(): Octopus['Text'] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return 'TODO' as any // TODO
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['TextLayer']> {
    return {
      type: 'TEXT',
      text: this._text,
    }
  }

  convert(): Octopus['TextLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
