import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import type { RawBlendMode, RawEffectShadow } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'
import { convertOpacity } from '../../utils/convert'
import { getColorFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

export class SourceEffectShadow extends SourceEntity {
  protected _rawValue: RawEffectShadow | undefined

  constructor(raw: RawEffectShadow | undefined) {
    super(raw)
    this._rawValue = raw
  }

  get distance(): number {
    return asFiniteNumber(this._rawValue?.distance, 0)
  }

  get localLightingAngle(): number {
    return asFiniteNumber(this._rawValue?.localLightingAngle?.value, 0)
  }

  get useGlobalAngle(): boolean {
    return this._rawValue?.useGlobalAngle ?? true
  }

  get blur(): number {
    return asFiniteNumber(this._rawValue?.blur, 5)
  }

  get choke(): number {
    return asFiniteNumber(this._rawValue?.chokeMatte, 0)
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
