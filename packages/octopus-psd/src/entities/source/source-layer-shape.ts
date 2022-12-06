import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { SourceEffectFill } from './source-effect-fill.js'
import { SourceLayerCommon } from './source-layer-common.js'
import { SourcePath } from './source-path.js'
import { SourceStroke } from './source-stroke.js'

import type { RawLayerShape } from '../../typings/raw'
import type { DocumentDimensions, SourceBounds } from '../../typings/source'
import type { SourceLayerParent } from './source-layer-common'
import type { SourcePathComponent } from './source-path-component'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

export class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawLayerShape

  constructor(options: SourceLayerShapeOptions) {
    super(options)
  }

  @firstCallMemo()
  get path(): SourcePath {
    return new SourcePath({
      vectorOriginationData: this._rawValue.parsedProperties?.vogk,
      vectorMaskSetting: this._rawValue.parsedProperties?.vmsk ?? this._rawValue?.parsedProperties?.vsms,
      documentDimensions: this.documentDimensions,
    })
  }

  get pathComponents(): SourcePathComponent[] {
    return this.path.pathComponents
  }

  get documentDimensions(): DocumentDimensions {
    return { width: this._parent.documentWidth, height: this._parent.documentHeight }
  }

  get firstPathComponent(): SourcePathComponent | undefined {
    return this.pathComponents[0]
  }

  get pathBounds(): SourceBounds {
    return this.path.bounds
  }

  @firstCallMemo()
  get fill(): SourceEffectFill {
    const { SoCo, GdFl, vscg } = this._rawValue.parsedProperties ?? {}
    const fill = SoCo ?? GdFl ?? vscg

    return new SourceEffectFill(fill, this._rawValue.parsedProperties?.vstk?.fillEnabled)
  }

  @firstCallMemo()
  get stroke(): SourceStroke {
    return new SourceStroke(this._rawValue?.parsedProperties?.vstk)
  }
}
