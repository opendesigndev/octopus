import { round } from '@opendesign/octopus-common/dist/utils/math.js'

import { getColorFor } from '../../utils/source.js'
import { SourceEntity } from './source-entity.js'

import type { RawTextStyle } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'

export class SourceTextTextStyle extends SourceEntity {
  protected _rawValue: RawTextStyle | undefined

  constructor(raw: RawTextStyle | undefined) {
    super(raw)
  }

  get fontPostScriptName(): string {
    return this._rawValue?.fontPostScriptName ?? ''
  }

  get fontName(): string | undefined {
    return this._rawValue?.fontName
  }

  get fontStyleName(): string | undefined {
    return this._rawValue?.fontStyleName
  }

  get size(): number {
    return this._rawValue?.size ?? 0
  }

  get lineHeight(): number {
    return round(this._rawValue?.leading ?? 0, 1)
  }

  get letterSpacing(): number {
    const tracking = this._rawValue?.tracking ?? 0
    return (tracking * this.size) / 1000
  }

  get kerning(): boolean {
    return true
  }

  get features(): [] {
    return []
  }

  get ligatures(): boolean {
    return this._rawValue?.ligatures ?? true
  }

  get altLigature(): boolean {
    return this._rawValue?.altligature ?? false
  }

  get underline(): boolean {
    return this._rawValue?.underline ?? false
  }

  get linethrough(): boolean {
    return this._rawValue?.strikethrough ?? false
  }

  get letterCase(): 'allCaps' | 'smallCaps' | undefined {
    return this._rawValue?.fontCaps
  }

  get color(): SourceColor | null {
    return getColorFor(this._rawValue?.color)
  }
}
