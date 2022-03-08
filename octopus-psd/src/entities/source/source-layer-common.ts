import type { RawBlendMode, RawLayer } from '../../typings/raw'
import { SourceArtboard } from './source-artboard'
import type { SourceLayerSection } from './source-layer-section'
import { getBoundsFor } from '../../utils/source'
import { SourceBounds } from '../../typings/source'
import { SourceLayerEffects } from './source-effects-layer'
import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

export type SourceLayerParent = SourceArtboard | SourceLayerSection

type SourceLayerType = 'backgroundLayer' | 'layerSection' | 'shapeLayer' | 'textLayer' | 'layer'
export class SourceLayerCommon {
  protected _rawValue: RawLayer
  protected _parent: SourceLayerParent

  get type(): SourceLayerType | undefined {
    return this._rawValue.type
  }

  get id(): string | undefined {
    return this._rawValue.id ? this._rawValue.id.toString() : undefined
  }

  get name(): string | undefined {
    return this._rawValue.name
  }

  get parentArtboard(): SourceArtboard {
    const parent = this._parent
    return parent instanceof SourceArtboard ? parent : parent.parentArtboard
  }

  get visible(): boolean | undefined {
    return this._rawValue.visible
  }

  get bounds(): SourceBounds {
    return getBoundsFor(this._rawValue.bounds)
  }

  get opacity(): number | undefined {
    return this._rawValue.blendOptions?.opacity?.value
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue.blendOptions?.mode
  }

  get clipped(): boolean | undefined {
    return this._rawValue.clipped
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
}
