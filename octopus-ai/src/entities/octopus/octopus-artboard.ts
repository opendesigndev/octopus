import { asArray } from '@avocode/octopus-common/dist/utils/as'

import { createOctopusLayer } from '../../factories/create-octopus-layer'

import type OctopusAIConverter from '../..'
import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type SourceArtboard from '../source/source-artboard'
import type SourceDesign from '../source/source-design'
import type SourceResources from '../source/source-resources'

type OctopusArtboardOptions = {
  sourceDesign: SourceDesign
  targetArtboardId: string
  octopusAIConverter: OctopusAIConverter
}

export default class OctopusArtboard {
  private _sourceArtboard: SourceArtboard
  private _octopusAIConverter: OctopusAIConverter
  private _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    const artboard = options.sourceDesign.getArtboardById(options.targetArtboardId)
    if (!artboard) {
      throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
    }
    this._octopusAIConverter = options.octopusAIConverter
    this._sourceArtboard = artboard
    this._layers = this._initLayers()
  }

  private _initLayers() {
    return asArray(this._sourceArtboard?.children).reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer,
      })
      return octopusLayer ? [...layers, octopusLayer] : layers
    }, [])
  }

  get dimensions(): Octopus['Dimensions'] {
    return this._sourceArtboard.dimensions
  }

  // get hiddenContentIds(): number[] {
  //   return asArray(this._sourceArtboard.hiddenContentObjectIds, [])
  //     .map((c) => c.ObjID)
  //     .filter((id) => asFiniteNumber(id)) as number[]
  // }

  get resources(): SourceResources {
    return this._sourceArtboard.resources
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
