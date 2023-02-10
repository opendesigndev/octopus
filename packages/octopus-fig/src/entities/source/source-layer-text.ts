import { firstCallMemo } from '@opendesign/octopus-common/decorators/first-call-memo'

import { SourceLayerCommon } from './source-layer-common'
import { SourceTextStyle } from './source-text-style'

import type { RawLayerText } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawLayerText

  constructor(options: SourceLayerTextOptions) {
    super(options)
  }

  get type(): 'TEXT' {
    return 'TEXT'
  }

  get characters(): string {
    return this._rawValue.characters ?? ''
  }

  get layoutVersion(): number | undefined {
    return this._rawValue.layoutVersion
  }

  get characterStyleOverrides(): number[] {
    return this._rawValue.characterStyleOverrides ?? []
  }

  @firstCallMemo()
  get styleOverrideTable(): { [key: string]: SourceTextStyle | undefined } {
    const styleOverrideTable = this._rawValue.styleOverrideTable ?? {}
    return Object.keys(styleOverrideTable).reduce((table, key) => {
      const rawStyle = styleOverrideTable[key]
      if (!rawStyle) return table
      table[key] = new SourceTextStyle(rawStyle)
      return table
    }, {} as { [key: string]: SourceTextStyle })
  }

  @firstCallMemo()
  get defaultStyle(): SourceTextStyle | null {
    if (!this._rawValue.style) return null
    return new SourceTextStyle(this._rawValue.style)
  }
}
