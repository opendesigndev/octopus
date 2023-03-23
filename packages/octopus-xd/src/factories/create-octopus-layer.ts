import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group.js'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-maskgroup.js'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape.js'
import { OctopusLayerText } from '../entities/octopus/octopus-layer-text.js'

import type { SourceLayer } from './create-source-layer.js'
import type { SourceLayerGroup } from '../entities/source/source-layer-group.js'
import type { SourceLayerShape } from '../entities/source/source-layer-shape.js'
import type { SourceLayerText } from '../entities/source/source-layer-text.js'
import type { OctopusLayerParent } from '../typings/octopus-entities.js'

export type OctopusLayer = OctopusLayerGroup | OctopusLayerShape | OctopusLayerMaskGroup | OctopusLayerText

type OctopusLayerBuilders =
  | typeof createOctopusLayerGroupLike
  | typeof createOctopusLayerShape
  | typeof createOctopusLayerText

type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

function createOctopusLayerGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
  return new OctopusLayerGroup({
    parent,
    sourceLayer: layer as SourceLayerGroup,
  })
}

function createOctopusLayerMaskGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerMaskGroup {
  return new OctopusLayerMaskGroup({
    parent,
    sourceLayer: layer as SourceLayerGroup,
  })
}

function createOctopusLayerGroupLike(options: CreateOctopusLayerOptions) {
  return OctopusLayerMaskGroup.isMaskGroupLike(options.layer)
    ? createOctopusLayerMaskGroup(options)
    : createOctopusLayerGroup(options)
}

function createOctopusLayerShape({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
  return new OctopusLayerShape({
    parent,
    sourceLayer: layer as SourceLayerShape,
  })
}

function createOctopusLayerText({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerText {
  return new OctopusLayerText({
    parent,
    sourceLayer: layer as SourceLayerText,
  })
}

export function createOctopusLayer(options: CreateOctopusLayerOptions): OctopusLayer | null {
  const type = (Object(options.layer) as SourceLayer).type

  const builders: { [key: string]: OctopusLayerBuilders } = {
    group: createOctopusLayerGroupLike,
    shape: createOctopusLayerShape,
    text: createOctopusLayerText,
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}
