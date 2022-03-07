import type { RawBlendMode, RawEffectShadow } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'
import { convertBlur, convertChoke, convertOpacity } from '../../utils/convert'
import { getColorFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

export class SourceEffectShadow extends SourceEntity {
  protected _rawValue: RawEffectShadow | undefined

  constructor(raw: RawEffectShadow | undefined) {
    super(raw)
    this._rawValue = raw
  }

  get distance(): number | undefined {
    return this._rawValue?.distance
  }

  get localLightingAngle(): number | undefined {
    return this._rawValue?.localLightingAngle?.value
  }

  get useGlobalAngle(): boolean {
    return this._rawValue?.useGlobalAngle ?? false
  }

  get blur(): number {
    return convertBlur(this._rawValue?.blur)
  }

  get choke(): number {
    return convertChoke(this._rawValue?.chokeMatte)
  }

  get color(): SourceColor | null {
    return getColorFor(this._rawValue?.color)
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue?.mode
  }

  get opacity(): number {
    return convertOpacity(this._rawValue?.opacity?.value)
  }

  get enabled(): boolean {
    return this._rawValue?.enabled ?? true
  }
}
