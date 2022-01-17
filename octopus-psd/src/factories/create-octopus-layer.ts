import type { OctopusLayerParent } from '../entities/octopus/octopus-layer-common'
import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape'
import { OctopusLayerText } from '../entities/octopus/octopus-layer-text'
import type { SourceLayerLayer } from '../entities/source/source-layer-layer'
import type { SourceLayerSection } from '../entities/source/source-layer-section'
import type { SourceLayerShape } from '../entities/source/source-layer-shape'
import type { SourceLayerText } from '../entities/source/source-layer-text'
import type { SourceLayer } from './create-source-layer'

export type OctopusLayer = OctopusLayerGroup // | OctopusLayerShape | OctopusLayerMaskGroup

type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

function createOctopusLayerGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
  return new OctopusLayerGroup({
    parent,
    sourceLayer: layer as SourceLayerSection,
  })
}

function createOctopusLayerShape({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
  return new OctopusLayerShape({
    parent,
    sourceLayer: layer as SourceLayerShape | SourceLayerLayer,
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
  const builders: { [key: string]: Function } = {
    layerSection: createOctopusLayerGroup,
    shapeLayer: createOctopusLayerShape,
    textLayer: createOctopusLayerText,
    layer: createOctopusLayerShape,
    // backgroundLayer: createOctopusLayerGroup, // TODO ignoruj
  }
  const builder = builders[type as string]
  if (typeof builder !== 'function') {
    const converter = options.parent.converter
    converter?.logger?.warn('createOctopusLayer: Unknown layer type', { extra: { type } })
    converter?.sentry?.captureMessage('createOctopusLayer: Unknown layer type', { extra: { type } })
    return null
  }
  return builder(options)
}
