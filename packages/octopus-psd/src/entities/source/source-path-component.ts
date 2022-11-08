import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { SourceEntity } from './source-entity.js'
import { SourcePathOrigin } from './source-path-origin.js'
import { SourceSubpath } from './source-subpath.js'

import type { RawPathComponent } from '../../typings/raw'
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