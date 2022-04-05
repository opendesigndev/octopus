import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { RawBlendMode, RawLayer } from '../../typings/raw'
import type { SourceBounds, SourceColor } from '../../typings/source'
import { getBoundsFor, getColorFor, getUnitRatioFor } from '../../utils/source'
import { SourceArtboard } from './source-artboard'
import { SourceLayerEffects } from './source-effects-layer'
import { SourceEntity } from './source-entity'
import type { SourceLayerSection } from './source-layer-section'
import { SourcePath } from './source-path'

export type SourceLayerParent = SourceArtboard | SourceLayerSection

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

  get artboardColor(): SourceColor | null {
    switch (this._rawValue.artboard?.artboardBackgroundType) {
      case 1: // white
        return getColorFor({ blue: 255, green: 255, red: 255 })
      case 2: // black
        return getColorFor({ blue: 0, green: 0, red: 0 })
      case 3: // transparent
        return null
      case 4: // other
        return getColorFor(this._rawValue.artboard?.color)
    }
    return null
  }

  get isArtboard(): boolean {
    return this._rawValue.artboard !== undefined
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
