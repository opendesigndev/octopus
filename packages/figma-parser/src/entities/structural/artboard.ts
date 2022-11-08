import type { FigmaArtboard } from '../../types/figma'

type ArtboardOptions = {
  artboard: FigmaArtboard
}

export class Artboard {
  private _artboard: FigmaArtboard

  constructor(options: ArtboardOptions) {
    this._artboard = options.artboard
  }

  get id(): string {
    return String(this._artboard.id)
  }

  get name(): string {
    return String(this._artboard.name)
  }
}
