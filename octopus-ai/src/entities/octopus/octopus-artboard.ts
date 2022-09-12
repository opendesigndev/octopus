import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import uniqueId from 'lodash/uniqueId'

import { initOctopusLayerChildren } from '../../utils/layer'
import { parseRect } from '../../utils/rectangle'

import type { OctopusAIConverter } from '../..'
import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type { SourceArtboard } from '../source/source-artboard'
import type { SourceDesign } from '../source/source-design'
import type { SourceResources } from '../source/source-resources'
import type { OctopusManifest } from './octopus-manifest'

type OctopusArtboardOptions = {
  targetArtboardId: string
  octopusAIConverter: OctopusAIConverter
}

export class OctopusArtboard {
  private _sourceArtboard: SourceArtboard
  private _octopusAIConverter: OctopusAIConverter
  private _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    const artboard = options.octopusAIConverter.sourceDesign.getArtboardById(options.targetArtboardId)

    if (!artboard) {
      throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
    }

    this._octopusAIConverter = options.octopusAIConverter
    this._sourceArtboard = artboard
    this._layers = this._initLayers()
  }

  private _initLayers() {
    return initOctopusLayerChildren({ layers: this._sourceArtboard.children, parent: this })
  }

  private _createMask(): Octopus['ShapeLayer'] {
    return {
      type: 'SHAPE',
      id: uniqueId(),
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
      id: uniqueId(),
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
    return this._octopusAIConverter.sourceDesign
  }

  get id(): string {
    return this._sourceArtboard.id
  }

  private async _getVersion(): Promise<string> {
    const pkg = await this._octopusAIConverter.pkg
    return pkg.version
  }

  get manifest(): OctopusManifest {
    return this._octopusAIConverter.manifest
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
