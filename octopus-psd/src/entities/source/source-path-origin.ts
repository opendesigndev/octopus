import type { RawOrigin } from '../../typings/raw'
import type { SourceBounds, SourceMatrix, SourceRadiiCorners } from '../../typings/source'
import { getBoundsFor, getMatrixFor, getRadiiCornersFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

export class SourcePathOrigin extends SourceEntity {
  protected _rawValue: RawOrigin | undefined

  constructor(origin: RawOrigin | undefined) {
    super(origin)
    this._rawValue = origin
  }

  get type(): string | undefined {
    return this._rawValue?.type ? this._rawValue.type.toString() : undefined
  }

  get bounds(): SourceBounds {
    return { ...this._rawValue?.bounds, ...getBoundsFor(this._rawValue?.bounds) }
  }

  get radii(): SourceRadiiCorners {
    return { ...this._rawValue?.radii, ...getRadiiCornersFor(this._rawValue?.radii) }
  }

  get Trnf(): SourceMatrix {
    return getMatrixFor(this._rawValue?.Trnf)
  }
}
