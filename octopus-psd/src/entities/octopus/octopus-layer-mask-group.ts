import { createOctopusLayer, OctopusLayer } from '../../factories/create-octopus-layer'
import { LayerSpecifics, OctopusLayerBase, OctopusLayerParent } from './octopus-layer-base'
import type { Octopus } from '../../typings/octopus'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import { SourceLayer } from '../../factories/create-source-layer'

type OctopusLayerMaskGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer // mask
  sourceLayers: SourceLayer[] // layers
}

export class OctopusLayerMaskGroup extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayer
  private _sourceLayers: SourceLayer[]
  private _layers: OctopusLayer[]

  constructor(options: OctopusLayerMaskGroupOptions) {
    super(options)
    this._sourceLayers = options.sourceLayers
    this._layers = this._initLayers()
  }

  get sourceMask(): SourceLayer {
    return this._sourceLayer
  }

  get sourceLayers(): SourceLayer[] {
    return this._sourceLayers
  }

  private _initLayers(): OctopusLayer[] {
    return this.sourceLayers.reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer,
      })
      return octopusLayer ? [octopusLayer, ...layers] : layers
    }, [])
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['MaskGroupLayer']> | null {
    const mask = createOctopusLayer({ parent: this, layer: this.sourceMask })?.convert()
    if (!mask) return null
    return {
      type: 'MASK_GROUP',
      maskBasis: 'BODY',
      mask,
      layers: getConverted(this._layers),
    } as const
  }


  convert(): Octopus['MaskGroupLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
