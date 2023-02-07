import { isBlendMode } from '../../utils/blend-modes.js'
import PROPS from '../../utils/prop-names.js'
import { SourceEntity } from './source-entity.js'

import type { RawEffectShadow } from '../../typings/raw'
import type BLEND_MODES from '../../utils/blend-modes.js'

export class SourceEffectBase extends SourceEntity {
  protected _rawValue: RawEffectShadow | undefined

  constructor(rawValue: RawEffectShadow | undefined) {
    super(rawValue)
  }

  get blendMode(): keyof typeof BLEND_MODES | undefined {
    const mode = this._rawValue?.[PROPS.MODE]

    return isBlendMode(mode) ? mode : undefined
  }

  get enabled(): boolean {
    return this._rawValue?.[PROPS.ENABLED] ?? true
  }
}
