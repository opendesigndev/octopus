import { asArray } from '@avocode/octopus-common/dist/utils/as'

import { createOctopusLayer } from '../../factories/create-octopus-layer'
import { OctopusAIConverter } from '../..'

import type { Octopus } from '../../typings/octopus'
import type SourceResources from '../source/source-resources'
import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type SourceDesign from '../source/source-design'
import type SourceArtboard from '../source/source-artboard'
import type AdditionalTextDataParser from '../../services/conversion/private-data-parser'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

type OctopusArtboardOptions = {
  targetArtboardId: string
  octopusAIConverter: OctopusAIConverter
  additionalTextDataParser?: AdditionalTextDataParser
}

export default class OctopusArtboard {
  private _sourceArtboard: SourceArtboard
  private _octopusAIConverter: OctopusAIConverter
  private _layers: OctopusLayer[]
  private _additionalTextDataParser?: AdditionalTextDataParser

  constructor(options: OctopusArtboardOptions) {
    const artboard = options.octopusAIConverter.sourceDesign.getArtboardById(options.targetArtboardId)

    if (!artboard) {
      throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
    }

    this._octopusAIConverter = options.octopusAIConverter
    this._sourceArtboard = artboard
    this._additionalTextDataParser = options.additionalTextDataParser
    this._layers = this._initLayers()
  }

  private _initLayers() {
    return asArray(this._sourceArtboard?.children).reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layers: [sourceLayer],
      })
      return octopusLayer ? [...layers, octopusLayer] : layers
    }, [])
  }

  //@todo remove if not necessary later
  // get hiddenContentIds(): number[] {
  //   return asArray(this._sourceArtboard.hiddenContentObjectIds, [])
  //     .map((c) => c.ObjID)
  //     .filter((id) => asFiniteNumber(id)) as number[]
  // }

  get resources(): SourceResources {
    return this._sourceArtboard.resources
  }

  get additionalTextDataParser(): Nullable<AdditionalTextDataParser> {
    return this._additionalTextDataParser
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

  async convert(): Promise<Octopus['OctopusDocument']> {
    const parentGroupLayer = this._layers[0]

    if (!parentGroupLayer) {
      throw new Error('Artboard is missing content')
    }

    const content = parentGroupLayer.convert()

    if (!content) {
      throw new Error('Error converting parent group layer')
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
      //@todo look at notes (this will change in future to handle backgrounds)
      content,
    }
  }
}
