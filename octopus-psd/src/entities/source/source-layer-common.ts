import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { isArtboard, getBoundsFor, getUnitRatioFor, getArtboardColor } from '../../utils/source.js'
import { SourceComponent } from './source-component.js'
import { SourceLayerEffects } from './source-effects-layer.js'
import { SourceEntity } from './source-entity.js'
import { SourcePath } from './source-path.js'

import type { RawBlendMode, RawLayer } from '../../typings/raw'
import type { SourceBounds, SourceColor } from '../../typings/source'
import type { SourceLayerSection } from './source-layer-section'

export type SourceLayerParent = SourceComponent | SourceLayerSection

type SourceLayerType = 'backgroundLayer' | 'layerSection' | 'shapeLayer' | 'textLayer' | 'layer' | 'adjustmentLayer'

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

  get type(): SourceLayerType | undefined {
    return this._rawValue.type
  }

  get id(): string | undefined {
    return this._rawValue.id ? this._rawValue.id.toString() : undefined
  }

  get name(): string | undefined {
    return this._rawValue.name
  }

  get parent(): SourceLayerParent {
    return this._parent
  }

  get parentComponent(): SourceComponent {
    const parent = this._parent
    return parent instanceof SourceComponent ? parent : parent.parentComponent
  }

  get artboardColor(): SourceColor | null {
    return getArtboardColor(this._rawValue)
  }

  get isArtboard(): boolean {
    return isArtboard(this._rawValue)
  }

  get visible(): boolean {
    return this._rawValue.visible ?? true
  }

  get bounds(): SourceBounds {
    return this.isArtboard ? getBoundsFor(this._rawValue.artboard?.artboardRect) : getBoundsFor(this._rawValue.bounds)
  }

  get opacity(): number {
    return getUnitRatioFor(this._rawValue.blendOptions?.opacity?.value)
  }

  get fillOpacity(): number {
    return getUnitRatioFor(this._rawValue.blendOptions?.fillOpacity?.value)
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue.blendOptions?.mode
  }

  get clipped(): boolean {
    return this._rawValue.clipped ?? false
  }

  get imageEffectsApplied(): boolean | undefined {
    return this._rawValue.imageEffectsApplied
  }

  get imageName(): string | undefined {
    return this._rawValue.imageName
  }

  @firstCallMemo()
  get layerEffects(): SourceLayerEffects {
    return new SourceLayerEffects(this._rawValue.layerEffects)
  }

  get bitmapMask(): string | undefined {
    return this._rawValue.mask?.imageName
  }

  @firstCallMemo()
  get path(): SourcePath | undefined {
    if (this._rawValue.path) return new SourcePath(this._rawValue.path)
  }
}
