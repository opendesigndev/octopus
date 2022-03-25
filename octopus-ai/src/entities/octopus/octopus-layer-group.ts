import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

import OctopusLayerCommon from './octopus-layer-common'
import { createOctopusLayer } from '../../factories/create-octopus-layer'

import type { LayerSpecifics } from './octopus-layer-common'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type SourceLayerGroup from '../source/source-layer-group'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type SourceLayerText from '../source/source-layer-text'
import type { SourceLayer } from '../../factories/create-source-layer'
import AdditionalTextDataParser from '../../services/conversion/private-data-parser'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  sourceLayers: SourceLayerGroup[]
}

type GetSourceLayerGroupingOptions = {
  sourceLayer: SourceLayer
  index: number
  sourceLayers: SourceLayer[]
  additionalTextDataParser: Nullable<AdditionalTextDataParser>
}

export default class OctopusLayerGroup extends OctopusLayerCommon {
  private _layers: OctopusLayer[]
  protected _sourceLayer: SourceLayerGroup

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  private _getSourceLayerGrouping({
    sourceLayer,
    index,
    sourceLayers,
    additionalTextDataParser,
  }: GetSourceLayerGroupingOptions): Nullable<SourceLayer[]> {
    if (sourceLayer.type !== 'TextGroup' || !additionalTextDataParser) {
      return [sourceLayer]
    }

    const sourceLayerTextGroup = additionalTextDataParser.getTextGrouping(
      sourceLayer as SourceLayerText,
      sourceLayers[index + 1]
    )
    if (!sourceLayerTextGroup) {
      return
    }

    return sourceLayerTextGroup
  }

  private _initLayers(): OctopusLayer[] {
    const additionalTextDataParser = this.parentArtboard.additionalTextDataParser
    return this._sourceLayer.children.reduce<OctopusLayer[]>((layers, sourceLayer, index, array) => {
      const groupedLayers = this._getSourceLayerGrouping({
        additionalTextDataParser,
        sourceLayer,
        sourceLayers: array,
        index,
      })

      if (!groupedLayers) {
        return layers
      }

      const octopusLayer = createOctopusLayer({
        parent: this,
        layers: groupedLayers,
      })

      return octopusLayer ? [...layers, octopusLayer] : layers
    }, [])
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['GroupLayer']> | null {
    const layers = getConverted(this._layers)

    return {
      type: 'GROUP',
      layers,
    }
  }

  convert(): Octopus['GroupLayer'] | null {
    const common = this.convertCommon()
    const specific = this._convertTypeSpecific()

    if (!common || !specific) return null

    return {
      ...common,
      ...specific,
    }
  }
}
