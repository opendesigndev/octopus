import type { RawImageFill } from '../../typings/source'


export type SourceEffectImageFillOptions = {
  effect: RawImageFill,
  layerWidth?: number,
  layerHeight?: number
}

export default class SourceEffectImageFill {
  private _rawEffect: RawImageFill

  constructor(options: SourceEffectImageFillOptions) {
    this._rawEffect = options.effect
  }

  get type() {
    return this._rawEffect?.type
  }

  get uid() {
    return this._rawEffect?.pattern?.meta?.ux?.uid
  }

  get scaleBehavior() {
    return this._rawEffect?.pattern?.meta?.ux?.scaleBehavior
  }

  get scale() {
    return this._rawEffect?.pattern?.meta?.ux?.scale
  }

  get scaleX() {
    return this._rawEffect?.pattern?.meta?.ux?.scaleX
  }

  get scaleY() {
    return this._rawEffect?.pattern?.meta?.ux?.scaleY
  }

  get offsetX() {
    return this._rawEffect?.pattern?.meta?.ux?.offsetX
  }

  get offsetY() {
    return this._rawEffect?.pattern?.meta?.ux?.offsetY
  }

  get flipX() {
    return this._rawEffect?.pattern?.meta?.ux?.flipX
  }

  get flipY() {
    return this._rawEffect?.pattern?.meta?.ux?.flipY
  }

  get imageWidth() {
    return this._rawEffect?.pattern?.width
  }

  get imageHeight() {
    return this._rawEffect?.pattern?.height
  }
}