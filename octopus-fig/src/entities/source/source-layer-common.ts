import { round } from '@avocode/octopus-common/dist/utils/math'

import { getTransformFor } from '../../utils/source'
import { SourceArtboard } from './source-artboard'
import { SourceEntity } from './source-entity'

import type { RawBlendMode, RawLayer } from '../../typings/raw'
import type { SourceTransform } from '../../typings/source'
import type { SourceLayerFrame } from './source-layer-frame'
import type { SourceLayerShape } from './source-layer-shape'

export type SourceLayerParent = SourceArtboard | SourceLayerFrame | SourceLayerShape

type SourceLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayer
}

export class SourceLayerCommon extends SourceEntity {
  protected _rawValue: RawLayer
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerOptions) {
    super(options.rawValue)
    this._parent = options.parent
  }

  get id(): string | undefined {
    return this._rawValue.id
  }

  get name(): string | undefined {
    return this._rawValue.name
  }

  get parent(): SourceLayerParent {
    return this._parent
  }

  get parentArtboard(): SourceArtboard {
    const parent = this._parent
    return parent instanceof SourceArtboard ? parent : parent.parentArtboard
  }

  get visible(): boolean {
    return this._rawValue.visible ?? true
  }

  get opacity(): number {
    return round(this._rawValue.opacity ?? 1)
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue.blendMode
  }

  get transform(): SourceTransform | null {
    return getTransformFor(this._rawValue.relativeTransform)
  }
}
