import type { RawPathComponent } from '../../typings/raw'
import type { SourceBounds, SourceMatrix, SourceRadiiCorners } from '../../typings/source'
import { getBoundsFor, getMatrixFor, getRadiiCornersFor } from '../../utils/source'
import { SourceSubpath } from './source-subpath'

export class SourcePathComponent {
  protected _rawValue: RawPathComponent

  constructor(component: RawPathComponent) {
    this._rawValue = component
  }

  get origin() {
    const origin = this._rawValue?.origin ?? {}
    const type = origin.type ? origin.type.toString() : undefined
    const bounds: SourceBounds = { ...origin.bounds, ...getBoundsFor(origin.bounds) }
    const radii: SourceRadiiCorners = { ...origin.radii, ...getRadiiCornersFor(origin.radii) }
    const Trnf: SourceMatrix = getMatrixFor(origin.Trnf)
    return { ...origin, type, bounds, radii, Trnf }
  }

  get subpathListKey() {
    return (this._rawValue.subpathListKey ?? []).map((subpath) => new SourceSubpath(subpath))
  }

  get shapeOperation() {
    return this._rawValue.shapeOperation
  }
}
