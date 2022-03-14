import path from 'path'
import type { Octopus } from '../../typings/octopus'
import type { SourceEffectFill } from '../source/source-effect-fill'
import { FOLDER_IMAGES, FOLDER_PATTERNS } from '../../utils/const'
import { OctopusArtboard } from './octopus-artboard'
import { logWarn } from '../../services/instances/misc'
import { createMatrix } from '../../utils/paper-factories'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'
import { convertOffset } from '../../utils/convert'
import type { SourceBounds } from '../../typings/source'
import { OctopusLayerBase } from './octopus-layer-base'
import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { OctopusEffectBase } from './octopus-effect-base'

type OctopusFillOptions = {
  parentLayer: OctopusLayerBase
  effect: SourceEffectFill
}

export class OctopusEffectOverlayPattern extends OctopusEffectBase {
  protected _parentLayer: OctopusLayerBase
  private _fill: SourceEffectFill

  constructor(options: OctopusFillOptions) {
    super(options)
    this._parentLayer = options.parentLayer
    this._fill = options.effect
  }

  private get _parentArtboard(): OctopusArtboard {
    return this._parentLayer.parentArtboard
  }

  private get _sourceLayerBounds(): SourceBounds {
    return this._parentLayer.sourceLayer.bounds
  }

  private get _imagePath(): string {
    const imageName = `${this._fill?.pattern?.ID}.png`
    return path.join(FOLDER_IMAGES, FOLDER_PATTERNS, imageName)
  }

  private get _offset(): [x: number, y: number] {
    const { width, height } = this._sourceLayerBounds
    const { x, y } = convertOffset(this._fill?.offset, width, height)
    return [x, y]
  }

  private get _opacity(): number {
    return this._fill?.opacity
  }

  private get _imageTransform(): Octopus['Transform'] | null {
    if (this._fill === undefined) return null
    const imagePath = this._imagePath
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

  @firstCallMemo()
  get overlay(): OctopusEffectFillImage | null {
    const transform = this._imageTransform
    if (transform === null) return null
    return new OctopusEffectFillImage({
      imagePath: this._imagePath,
      transform,
      opacity: this._opacity,
      layout: 'TILE',
      origin: 'ARTBOARD',
    })
  }

  convert(): Octopus['EffectOverlay'] | null {
    const overlay = this.overlay
    if (overlay === null) return null
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OVERLAY', visible, blendMode, basis, overlay: overlay.convert() }
  }
}