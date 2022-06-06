import { DEFAULTS } from '../../utils/defaults'
import { getGeometryFor } from '../../utils/source'
import { SourceLayerCommon } from './source-layer-common'
import { SourceTextStyle } from './source-text-style'

import type { RawAlign, RawLayerText, RawStrokeCap, RawStrokeJoin } from '../../typings/raw'
import type { SourceGeometry } from '../../typings/source'
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

  get fillGeometry(): SourceGeometry[] {
    return getGeometryFor(this._rawValue.fillGeometry)
  }

  get strokeGeometry(): SourceGeometry[] {
    return getGeometryFor(this._rawValue.strokeGeometry)
  }

  get strokeWeight(): number {
    return this._rawValue.strokeWeight ?? 0
  }

  get strokeAlign(): RawAlign {
    return this._rawValue.strokeAlign ?? DEFAULTS.STROKE_ALIGN
  }

  get strokeCap(): RawStrokeCap {
    return this._rawValue.strokeCap ?? DEFAULTS.STROKE_CAP
  }

  get strokeJoin(): RawStrokeJoin {
    return this._rawValue.strokeJoin ?? DEFAULTS.STROKE_JOIN
  }

  get strokeDashes(): number[] {
    return this._rawValue.strokeDashes ?? []
  }

  get strokeMiterAngle(): number {
    return this._rawValue.strokeMiterAngle ?? DEFAULTS.STROKE_MITER_ANGLE
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

  get styleOverrideTable(): { [key: string]: SourceTextStyle | undefined } {
    const styleOverrideTable = this._rawValue.styleOverrideTable ?? {}
    return Object.keys(styleOverrideTable).reduce((table, key) => {
      const rawStyle = styleOverrideTable[key]
      if (!rawStyle) return table
      table[key] = new SourceTextStyle(rawStyle)
      return table
    }, {} as { [key: string]: SourceTextStyle })
  }

  get defaultStyle(): SourceTextStyle | null {
    if (!this._rawValue.style) return null
    return new SourceTextStyle(this._rawValue.style)
  }
}
