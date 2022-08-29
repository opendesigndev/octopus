import { firstCallMemo } from '@avocode/octopus-common/dist/decorators/first-call-memo'

import { getBoundsFor, getMatrixFor, getRadiiCornersFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

import type { RawOrigin } from '../../typings/raw'
import type { SourceBounds, SourceMatrix, SourceRadiiCorners } from '../../typings/source'

export class SourcePathOrigin extends SourceEntity {
  protected _rawValue: RawOrigin | undefined

  constructor(raw: RawOrigin | undefined) {
    super(raw)
  }

  get type(): string | undefined {
    return this._rawValue?.type ? String(this._rawValue.type) : undefined
  }

  @firstCallMemo()
  get bounds(): SourceBounds {
    return { ...this._rawValue?.bounds, ...getBoundsFor(this._rawValue?.bounds) }
  }

  @firstCallMemo()
  get radii(): SourceRadiiCorners {
    return { ...this._rawValue?.radii, ...getRadiiCornersFor(this._rawValue?.radii) }
  }

  @firstCallMemo()
  get Trnf(): SourceMatrix {
    return getMatrixFor(this._rawValue?.Trnf)
  }
}
