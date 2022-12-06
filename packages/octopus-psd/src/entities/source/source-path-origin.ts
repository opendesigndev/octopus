import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { getBoundsFor, getMatrixFor, getRadiiCornersFor } from '../../utils/source.js'
import { SourceEntity } from './source-entity.js'

import type { VectorOriginationDatakeyDescriptor } from '../../typings/raw'
import type { SourceBounds, SourceMatrix, SourceRadiiCorners } from '../../typings/source'

export class SourcePathOrigin extends SourceEntity {
  protected _rawValue: VectorOriginationDatakeyDescriptor | undefined

  static TYPE_MAP = {
    1: 'rect',
    2: 'roundedRect',
    4: 'line',
    5: 'ellipse',
  }

  constructor(raw: VectorOriginationDatakeyDescriptor | undefined) {
    super(raw)
    this._rawValue = raw
  }

  get type(): string | undefined {
    const typeKey = this._rawValue?.keyOriginType
    return typeKey
      ? SourcePathOrigin.TYPE_MAP[typeKey as keyof typeof SourcePathOrigin.TYPE_MAP] ?? String(typeKey)
      : undefined
  }

  @firstCallMemo()
  get bounds(): SourceBounds {
    return getBoundsFor(this._rawValue?.keyOriginShapeBBox)
  }

  @firstCallMemo()
  get radii(): SourceRadiiCorners {
    return { ...this._rawValue?.keyOriginRRectRadii, ...getRadiiCornersFor(this._rawValue?.keyOriginRRectRadii) }
  }

  @firstCallMemo()
  get Trnf(): SourceMatrix {
    return getMatrixFor(this._rawValue?.Trnf)
  }
}
