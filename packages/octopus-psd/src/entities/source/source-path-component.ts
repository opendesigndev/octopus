import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import { SourceEntity } from './source-entity.js'
import { SourcePathOrigin } from './source-path-origin.js'
import { SourceSubpath } from './source-subpath.js'

import type { RawCombineOperation } from '../../typings/raw'
import type { RawSourcePathComponent, SourceCombineOperation } from '../../typings/source'

export class SourcePathComponent extends SourceEntity {
  protected _rawValue: RawSourcePathComponent

  static SHAPE_OPERATION = ['xor', 'add', 'subtract', 'interfaceIconFrameDimmed'] as RawCombineOperation[]

  constructor(raw: RawSourcePathComponent) {
    super(raw)
    this._rawValue = raw
  }

  @firstCallMemo()
  get origin(): SourcePathOrigin {
    return new SourcePathOrigin(this._rawValue.origin)
  }

  @firstCallMemo()
  get subpathListKey(): SourceSubpath[] {
    return asArray(this._rawValue?.subpathListKey).map((subpath) => new SourceSubpath(subpath))
  }

  get shapeOperation(): SourceCombineOperation | undefined {
    return SourcePathComponent.SHAPE_OPERATION[this._rawValue.shapeOperation ?? -1]
  }
}
