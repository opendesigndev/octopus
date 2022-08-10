import { firstCallMemo } from '@avocode/octopus-common/dist/decorators/first-call-memo'

import { getBoundsFor } from '../../utils/source.js'
import { SourceEntity } from './source-entity.js'
import { SourcePathComponent } from './source-path-component.js'

import type { RawPath } from '../../typings/raw/index.js'
import type { SourceBounds } from '../../typings/source.js'

export class SourcePath extends SourceEntity {
  protected _rawValue: RawPath | undefined

  constructor(raw: RawPath | undefined) {
    super(raw)
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
