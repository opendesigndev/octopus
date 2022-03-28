import type { OctopusLayerParent } from '../entities/octopus/octopus-layer-base'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import type { OctopusLayer } from './create-octopus-layer'

type CreateOctopusLayerOptions = {
  mask: OctopusLayer
  layers: OctopusLayer[]
  parent: OctopusLayerParent
}

export function createClippingMask({ mask, layers, parent }: CreateOctopusLayerOptions): OctopusLayerMaskGroup {
  const id = `${mask.id}:ClippingMask`
  const maskBasis = 'BODY'
  return new OctopusLayerMaskGroup({ id, parent, mask, layers, maskBasis })
}
