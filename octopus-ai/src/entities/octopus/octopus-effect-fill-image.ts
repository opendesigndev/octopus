import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type SourceLayerXObjectImage from '../source/source-layer-x-object-image'

type OctopusEffectImageFillOptions = {
  sourceLayer: SourceLayerXObjectImage
  parent: OctopusLayerParent
}

export default class OctopusEffectImageFill {
  private _parent: OctopusLayerParent
  private _sourceLayer: SourceLayerXObjectImage

  constructor(options: OctopusEffectImageFillOptions) {
    this._sourceLayer = options.sourceLayer
    this._parent = options.parent
  }

  _parseImageRef(): Nullable<Octopus['ImageRef']> {
    const imageName = this._sourceLayer.name

    if (!imageName) {
      return null
    }

    const imageId = this._parent.resources?.getXObject(imageName)?.fileName
    if (!imageId) {
      return null
    }

    const imagePath = this._parent.parentArtboard.manifest.getExportedRelativeImageById(imageId)

    if (!imagePath) {
      return null
    }

    return {
      type: 'RESOURCE',
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
      layout: 'FILL',
      origin: 'ARTBOARD',
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
