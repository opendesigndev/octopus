import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { initOctopusLayerChildren } from '../../utils/layer'
import { parseRect } from '../../utils/rectangle'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { DesignConverter } from '../../services/conversion/design-converter'
import type { Octopus } from '../../typings/octopus'
import type { SourceArtboard } from '../source/source-artboard'
import type { SourceDesign } from '../source/source-design'
import type { SourceResources } from '../source/source-resources'
import type { OctopusManifest } from './octopus-manifest'

type OctopusArtboardOptions = {
  targetArtboardId: string
  designConverter: DesignConverter
}

export class OctopusArtboard {
  private _sourceArtboard: SourceArtboard
  private _designConverter: DesignConverter
  private _layers: OctopusLayer[]
  private _id: string

  constructor(options: OctopusArtboardOptions) {
    const artboard = options.designConverter.sourceDesign.getArtboardById(options.targetArtboardId)

    if (!artboard) {
      throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
    }

    this._designConverter = options.designConverter
    this._sourceArtboard = artboard
    this._layers = this._initLayers()
    this._id = this._designConverter.uniqueId()
  }

  private _initLayers() {
    return initOctopusLayerChildren({ layers: this._sourceArtboard.children, parent: this })
  }

  private _createMask(): Octopus['ShapeLayer'] {
    return {
      type: 'SHAPE',
      id: this._designConverter.uniqueId(),
      shape: {
        path: parseRect(this._sourceArtboard.mediaBox),
        fills: [
          {
            type: 'COLOR',
            visible: true,
            blendMode: 'NORMAL',
            color: {
              r: 1,
              g: 1,
              b: 1,
              a: 1,
            },
          },
        ],
      },
    }
  }

  private _createParentMaskGroup(): Octopus['MaskGroupLayer'] {
    const layers = getConverted(this._layers)

    return {
      id: this._designConverter.uniqueId(),
      type: 'MASK_GROUP',
      mask: this._createMask(),
      maskBasis: 'BODY',
      layers,
    }
  }

  get resources(): SourceResources {
    return this._sourceArtboard.resources
  }

  get sourceDesign(): SourceDesign {
    return this._designConverter.sourceDesign
  }

  get id(): string {
    return this._id
  }

  private async _getVersion(): Promise<string> {
    const pkg = await this._designConverter.octopusAIConverter.pkg
    return pkg.version
  }

  get manifest(): OctopusManifest {
    return this._designConverter.manifest
  }

  get designConverter(): DesignConverter {
    return this._designConverter
  }

  async convert(): Promise<Octopus['OctopusDocument']> {
    if (!this._layers || !this._layers.length) {
      throw new Error('Artboard is missing content')
    }

    if (typeof this._sourceArtboard.id !== 'string') {
      throw new Error("Artboard 'id' property is missing.")
    }

    const dimensions = this._sourceArtboard.dimensions

    return {
      type: 'ARTBOARD',
      version: await this._getVersion(),
      id: this.id,
      dimensions,
      content: this._createParentMaskGroup(),
    }
  }
}
