import { firstCallMemo } from '@opendesign/octopus-common/decorators/first-call-memo'

import { SourceEntity } from './source-entity'
import { SourcePathOrigin } from './source-path-origin'
import { SourceSubpath } from './source-subpath'

import type { RawPathComponent } from '../../typings/raw/index'
import type { SourceCombineOperation } from '../../typings/source'

export class SourcePathComponent extends SourceEntity {
  protected _rawValue: RawPathComponent

  constructor(raw: RawPathComponent) {
    super(raw)
  }

  @firstCallMemo()
  get origin(): SourcePathOrigin {
    return new SourcePathOrigin(this._rawValue.origin)
  }

  @firstCallMemo()
  get subpathListKey(): SourceSubpath[] {
    return (this._rawValue.subpathListKey ?? []).map((subpath) => new SourceSubpath(subpath))
  }

  get shapeOperation(): SourceCombineOperation | undefined {
    return this._rawValue.shapeOperation
  }
}
