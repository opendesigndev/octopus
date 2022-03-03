import path from 'path'
import type { Octopus } from '../../typings/octopus'
import type { SourceEffectFill } from '../source/source-effect-fill'
import type { SourceLayerEffects } from '../source/source-effects-layer'
import { FOLDER_IMAGES, FOLDER_PATTERNS } from '../../utils/const'
import { OctopusArtboard } from './octopus-artboard'
import { logWarn } from '../../services/instances/misc'
import { createMatrix } from '../../utils/paper-factories'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'
import { convertBlendMode } from '../../utils/convert'

type OctopusFillOptions = {
  parentArtboard: OctopusArtboard
  effects: SourceLayerEffects
  fill: SourceEffectFill
}

export class OctopusEffectOverlayPattern {
  protected _parentArtboard: OctopusArtboard
  protected _effects: SourceLayerEffects
  protected _fill: SourceEffectFill

  constructor(options: OctopusFillOptions) {
    this._parentArtboard = options.parentArtboard
    this._effects = options.effects
    this._fill = options.fill
  }

  get imagePath(): string {
    const imageName = `${this._fill?.pattern?.ID}.png`
    return path.join(FOLDER_IMAGES, FOLDER_PATTERNS, imageName)
  }

  private get _offset(): [x: number, y: number] {
    const { x, y } = this._fill?.phase
    return [x, y]
  }

  get imageTransform(): Octopus['Transform'] | null {
    if (this._fill === undefined) return null
    const imagePath = this.imagePath
    const images = this._parentArtboard.sourceDesign.images
    const { width, height } = images.find((img) => img.path === imagePath) ?? {}
    if (width === undefined || height === undefined) {
      logWarn('Unknown image', { imagePath })
      return null
    }
    const matrix = createMatrix(width, 0, 0, height, ...this._offset)
    matrix.scale(this._fill.scale)
    matrix.rotate(-this._fill.angle, 0, 0)
    return matrix.values
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertBlendMode(this._fill?.blendMode)
  }

  get visible(): boolean {
    const enabled = this._fill?.enabled ?? false
    const enabledAll = this._effects.enabledAll ?? false
    return enabledAll && enabled
  }

  convert(): Octopus['EffectOverlay'] | null {
    const transform = this.imageTransform
    if (transform === null) return null
    const overlay = new OctopusEffectFillImage({
      imagePath: this.imagePath,
      transform,
      opacity: this._fill?.opacity,
      layout: 'TILE',
      origin: 'ARTBOARD',
    }).convert()

    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OVERLAY', visible, blendMode, basis, overlay }
  }
}