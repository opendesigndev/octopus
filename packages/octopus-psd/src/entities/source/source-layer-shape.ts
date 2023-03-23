import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { SourceEffectFill } from './source-effect-fill.js'
import { SourceLayerCommon } from './source-layer-common.js'
import { SourcePath } from './source-path.js'
import { SourceStroke } from './source-stroke.js'
import PROPS from '../../utils/prop-names.js'

import type { SourceLayerParent } from './source-layer-common.js'
import type { SourcePathComponent } from './source-path-component.js'
import type { RawLayerShape } from '../../typings/raw/index.js'
import type { SourceDocumentDimensions, SourceBounds } from '../../typings/source.js'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

export class SourceLayerShape extends SourceLayerCommon {
  declare _rawValue: RawLayerShape

  constructor(options: SourceLayerShapeOptions) {
    super(options)
  }

  @firstCallMemo()
  get path(): SourcePath {
    return new SourcePath({
      vectorOriginationData: this._rawValue.layerProperties?.[PROPS.VECTOR_ORIGINATION_DATA],
      vectorMaskSetting:
        this._rawValue.layerProperties?.[PROPS.VECTOR_MASK_SETTING1] ??
        this._rawValue?.layerProperties?.[PROPS.VECTOR_MASK_SETTING2],
      documentDimensions: this.documentDimensions,
    })
  }

  get pathComponents(): SourcePathComponent[] {
    return this.path.pathComponents
  }

  get documentDimensions(): SourceDocumentDimensions {
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
    const solidColorSheetSetting = this._rawValue.layerProperties?.[PROPS.SOLID_COLOR_SHEET_SETTING]
    const gradientFillSetting = this._rawValue.layerProperties?.[PROPS.GRADIENT_FILL_SETTING]
    const vectorStrokeContentData = this._rawValue.layerProperties?.[PROPS.VECTOR_STROKE_CONTENT_DATA]

    const fill = solidColorSheetSetting ?? gradientFillSetting ?? vectorStrokeContentData

    return new SourceEffectFill(fill, this._rawValue.layerProperties?.[PROPS.VECTOR_STROKE_DATA]?.fillEnabled)
  }

  @firstCallMemo()
  get stroke(): SourceStroke {
    return new SourceStroke(this._rawValue?.layerProperties?.[PROPS.VECTOR_STROKE_DATA])
  }
}
