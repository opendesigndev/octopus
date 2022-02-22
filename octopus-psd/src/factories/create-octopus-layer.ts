import type { OctopusLayerParent } from '../entities/octopus/octopus-layer-common'
import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape'
import { OctopusLayerShapeLayerAdapter } from '../entities/octopus/octopus-layer-shape-layer-adapter'
import { OctopusLayerShapeShapeAdapter } from '../entities/octopus/octopus-layer-shape-shape-adapter'
import { OctopusLayerText } from '../entities/octopus/octopus-layer-text'
import type { SourceLayerLayer } from '../entities/source/source-layer-layer'
import type { SourceLayerSection } from '../entities/source/source-layer-section'
import type { SourceLayerShape } from '../entities/source/source-layer-shape'
import type { SourceLayerText } from '../entities/source/source-layer-text'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import type { SourceLayer } from './create-source-layer'
import { logWarn } from '../services/instances/misc'

export type OctopusLayer = OctopusLayerGroup | OctopusLayerText | OctopusLayerShape

type OctopusLayerBuilders =
  | typeof createOctopusLayerGroup
  | typeof createOctopusLayerShapeFromShapeAdapter
  | typeof createOctopusLayerText
  | typeof createOctopusLayerShapeFromLayerAdapter

type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

function createOctopusLayerGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
  const sourceLayer = layer as SourceLayerSection
  return new OctopusLayerGroup({ parent, sourceLayer })
}

function createOctopusLayerShapeFromShapeAdapter({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
  const sourceLayer = layer as SourceLayerShape
  const adapter = new OctopusLayerShapeShapeAdapter({ parent, sourceLayer })
  return new OctopusLayerShape({ parent, sourceLayer, adapter })
}

function createOctopusLayerShapeFromLayerAdapter({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
  const sourceLayer = layer as SourceLayerLayer
  const adapter = new OctopusLayerShapeLayerAdapter({ parent, sourceLayer })
  return new OctopusLayerShape({ parent, sourceLayer, adapter })
}

function createOctopusLayerText({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerText {
  const sourceLayer = layer as SourceLayerText
  return new OctopusLayerText({ parent, sourceLayer })
}

const OCTOPUS_BUILDER_MAP: { [key: string]: OctopusLayerBuilders } = {
  layerSection: createOctopusLayerGroup,
  shapeLayer: createOctopusLayerShapeFromShapeAdapter,
  textLayer: createOctopusLayerText,
  layer: createOctopusLayerShapeFromLayerAdapter,
  // backgroundLayer: createOctopusLayerGroup, // TODO ignoruj
} as const

export function createOctopusLayer(options: CreateOctopusLayerOptions): OctopusLayer | null {
  const type = (Object(options.layer) as SourceLayer).type
  const builder = getMapped(type, OCTOPUS_BUILDER_MAP, undefined)
  if (typeof builder !== 'function') {
    logWarn('createOctopusLayer: Unknown layer type', { type })
    return null
  }
  return builder(options)
}
