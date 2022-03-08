import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import type { RawPathComponent } from '../../typings/raw'
import type { SourceCombineOperation } from '../../typings/source'
import { SourcePathOrigin } from './source-path-origin'
import { SourceSubpath } from './source-subpath'

export class SourcePathComponent {
  protected _rawValue: RawPathComponent

  constructor(component: RawPathComponent) {
    this._rawValue = component
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
