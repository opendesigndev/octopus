import { createOctopusLayer } from '../factories/create-octopus-layer'
import OctopusAIConverter from '..'
import SourceDesign from '../entities-source/source-design'
import SourceArtboard from '../entities-source/source-artboard'
import { OctopusLayer } from '../factories/create-octopus-layer'
import { asArray } from '@avocode/octopus-common/dist/utils/as'
import type { Octopus } from '../typings/octopus'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import SourceResources from '../entities-source/source-resources'

type OctopusArtboardOptions = {
  sourceDesign: SourceDesign
  targetArtboardId: string
  octopusAIConverter: OctopusAIConverter
}

export default class OctopusArtboard {
  private _sourceDesign: SourceDesign
  private _sourceArtboard: SourceArtboard
  private _octopusAIConverter: OctopusAIConverter
  private _layers: OctopusLayer[]

  constructor(options: OctopusArtboardOptions) {
    const artboard = options.sourceDesign.getArtboardById(options.targetArtboardId)
    if (!artboard) {
      throw new Error(`Can't find target artboard by id "${options.targetArtboardId}"`)
    }
    this._octopusAIConverter = options.octopusAIConverter
    this._sourceDesign = options.sourceDesign
    this._sourceArtboard = artboard
    this._layers = this._initLayers()
  }

  private _initLayers() {
    return (
      this._sourceArtboard?.children?.reduce((layers, sourceLayer) => {
        const octopusLayer = createOctopusLayer({
          parent: this,
          layer: sourceLayer,
        })
        return octopusLayer ? [...layers, octopusLayer] : layers
      }, []) || []
    )
  }

  get dimensions(): Octopus['Dimensions'] {
    return this._sourceArtboard.dimensions
  }

  get hiddenContentIds(): number[] {
    return asArray(this._sourceArtboard.hiddenContentObjectIds, [])
      .map((c) => c.ObjID)
      .filter((id) => id) as number[]
  }

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
    if (typeof this._sourceArtboard.id !== 'string') {
      throw new Error("Artboard 'id' property is missing.")
    }

    const dimensions = this._sourceArtboard.dimensions

    return {
      type: 'ARTBOARD',
      version: await this._getVersion(),
      id: this.id,
      dimensions,
      layers: getConverted(this._layers),
    }
  }
}
