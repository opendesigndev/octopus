import type { RawBlendMode, RawLayer } from '../../typings/raw'
import { SourceArtboard } from './source-artboard'
import type { SourceLayerSection } from './source-layer-section'
import { getBoundsFor, getUnitRatioFor } from '../../utils/source'
import { SourceBounds } from '../../typings/source'
import { SourceLayerEffects } from './source-effects-layer'
import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { SourceEntity } from './source-entity'

export type SourceLayerParent = SourceArtboard | SourceLayerSection

type SourceLayerType = 'backgroundLayer' | 'layerSection' | 'shapeLayer' | 'textLayer' | 'layer'

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
    this._rawValue = options.rawValue
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

  get parentArtboard(): SourceArtboard {
    const parent = this._parent
    return parent instanceof SourceArtboard ? parent : parent.parentArtboard
  }

  get visible(): boolean {
    return this._rawValue.visible ?? true
  }

  get bounds(): SourceBounds {
    return getBoundsFor(this._rawValue.bounds)
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
}
