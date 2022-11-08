import { SourceLayerXObjectForm } from '../entities/source/source-layer-x-object-form'

import type { SourceLayerParent } from '../entities/source/source-layer-common'
import type { SourceLayerShape } from '../entities/source/source-layer-shape'
import type { SourceLayer } from '../factories/create-source-layer'
import type { RawResourcesExtGStateSmask, RawResourcesXObject } from '../typings/raw'
import type { Nullish } from '@opendesign/octopus-common/dist/utils/utility-types'

export function initClippingMask(layer: SourceLayer): Nullish<SourceLayerShape> {
  if (!('clippingPaths' in layer)) {
    return
  }

  if (layer.type === 'Shading' || !layer.clippingPaths || !layer.clippingPaths.length) {
    return
  }

  const mask = layer.clippingPaths.reduce((mask, clippingPath) => {
    mask.setSubpaths([...mask.subpaths, ...clippingPath.subpaths])
    return mask
  })

  return mask
}

type CreateSoftMaskOptions = {
  sMask: Nullish<RawResourcesExtGStateSmask>
  parent: SourceLayerParent
}

export function createSoftMask({ sMask, parent }: CreateSoftMaskOptions): Nullish<SourceLayerXObjectForm> {
  const g = sMask?.G

  if (!g) {
    return null
  }

  const subType = 'Subtype' in g ? g.Subtype : ''

  if (subType !== 'Form') {
    return null
  }

  const rawSourceXObject = g as RawResourcesXObject

  return new SourceLayerXObjectForm({ parent, rawValue: rawSourceXObject })
}
