import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import uniqueId from 'lodash/uniqueId'

import { buildOctopusLayer, createOctopusLayerGroup } from '../../factories/create-octopus-layer'
import { OctopusLayerCommon } from './octopus-layer-common'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { SourceLayer } from '../../factories/create-source-layer'
import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { SourceLayerXObjectForm } from '../source/source-layer-x-object-form'

export type SourceLayerWithSoftMask = SourceLayer & { softMask: SourceLayerXObjectForm }

type OctopusLayerSoftMaskGroupOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

type MaskChannels = [number, number, number, number, number]
/**  @TODO rendering is not supporting yet masking with groups. check when rendering is ready. **/
export class OctopusLayerSoftMaskGroup extends OctopusLayerCommon {
  protected _sourceLayer: SourceLayerWithSoftMask
  private _layers: OctopusLayer[]
  protected _id: string

  static LUMINOSITY_MASK_CHANNELS: MaskChannels = [0.299, 0.587, 0.114, 0, 0]
  static INVERSE_LUMINOSITY_MASK_CHANNELS: MaskChannels = [-0.299, -0.587, -0.114, 0, 1]
  static DEFAULT_MASK_CHANNELS: MaskChannels = [0, 0, 0, 1, 0]

  constructor(options: OctopusLayerSoftMaskGroupOptions) {
    super(options)

    this._layers = this._initLayers()
    this._id = uniqueId()
  }

  private _createMask() {
    const mask = createOctopusLayerGroup({
      layerSequence: { sourceLayers: [this._sourceLayer.softMask] },
      parent: this,
    })

    if (!mask) {
      return null
    }

    const converted = mask.convert()
    if (!converted) {
      return null
    }

    converted.visible = false
    return converted
  }

  private _initLayers() {
    const layer = buildOctopusLayer({ parent: this, layerSequence: { sourceLayers: [this._sourceLayer] } })
    if (!layer) {
      return []
    }

    return [layer]
  }

  private _getMaskChannels(): MaskChannels {
    const maskType = this._sourceLayer.sMask?.S
    const TR = this._sourceLayer.sMask?.TR

    if (!maskType) {
      return OctopusLayerSoftMaskGroup.DEFAULT_MASK_CHANNELS
    }

    if (maskType === 'Luminosity' && !TR) {
      return OctopusLayerSoftMaskGroup.LUMINOSITY_MASK_CHANNELS
    }

    if (maskType === 'Luminosity' && TR) {
      return OctopusLayerSoftMaskGroup.INVERSE_LUMINOSITY_MASK_CHANNELS
    }

    return OctopusLayerSoftMaskGroup.DEFAULT_MASK_CHANNELS
  }

  private _convertTypeSpecific() {
    const mask = this._createMask()

    if (!mask) {
      return null
    }

    const maskChannels = this._getMaskChannels()

    return {
      maskChannels,
      type: 'MASK_GROUP' as const,
      maskBasis: 'LAYER_AND_EFFECTS',
      layers: getConverted(this._layers),
      mask,
    } as const
  }

  convert(): Octopus['MaskGroupLayer'] | null {
    const common = this.convertCommon()
    const specific = this._convertTypeSpecific()

    if (!specific) {
      return null
    }

    return {
      ...common,
      ...specific,
    }
  }
}
