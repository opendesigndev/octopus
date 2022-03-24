import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import type { RawPath } from '../../typings/raw'
import type { SourceBounds } from '../../typings/source'
import { getBoundsFor } from '../../utils/source'
import { SourceEntity } from './source-entity'
import { SourcePathComponent } from './source-path-component'

export class SourcePath extends SourceEntity {
  protected _rawValue: RawPath | undefined

  constructor(path: RawPath | undefined) {
    super(path)
    this._rawValue = path
  }

  get bounds(): SourceBounds {
    return getBoundsFor(this._rawValue?.bounds)
  }

  @firstCallMemo()
  get pathComponents(): SourcePathComponent[] {
    const components = this._rawValue?.pathComponents ?? []
    return components.map((component) => new SourcePathComponent(component))
  }
}
