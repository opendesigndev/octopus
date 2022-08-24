import type { Octopus } from '../../typings/octopus'
import type { OctopusEffectParent } from '../../typings/octopus-entities'
import type { SourceLayerXObjectImage } from '../source/source-layer-x-object-image'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

/** @TODO check images as mask when rendering is ready */
type OctopusEffectImageFillOptions = {
  sourceLayer: SourceLayerXObjectImage
  parent: OctopusEffectParent
}

export class OctopusEffectImageFill {
  private _parent: OctopusEffectParent
  private _sourceLayer: SourceLayerXObjectImage

  static REVERSE_IMAGE_MATRIX = [1, 0, 0, -1, 0, 1]

  constructor(options: OctopusEffectImageFillOptions) {
    this._sourceLayer = options.sourceLayer
    this._parent = options.parent
  }

  _parseImageRef(): Nullable<Octopus['ImageRef']> {
    const imageId = this._sourceLayer.fileName
    if (!imageId) {
      return null
    }

    const imagePath = this._parent.parentArtboard.manifest.getExportedRelativeImageById(imageId)

    if (!imagePath) {
      return null
    }

    return {
      type: 'PATH',
      value: imagePath,
    }
  }

  _parseImage(): Nullable<Octopus['Image']> {
    const ref = this._parseImageRef()

    if (!ref) {
      return null
    }

    return {
      ref,
    }
  }

  _parsePositioning(): Octopus['FillPositioning'] {
    return {
      layout: 'STRETCH',
      origin: 'LAYER',
      transform: OctopusEffectImageFill.REVERSE_IMAGE_MATRIX,
    }
  }

  convert(): Nullable<Octopus['FillImage']> {
    const image = this._parseImage()

    if (!image) {
      return null
    }

    return {
      type: 'IMAGE' as const,
      image,
      positioning: this._parsePositioning(),
    }
  }
}
