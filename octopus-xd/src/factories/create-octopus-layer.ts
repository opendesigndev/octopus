import { OctopusLayerParent } from '../entities/octopus-layer-common'
import OctopusLayerGroup from '../entities/octopus-layer-group'
import OctopusLayerShape from '../entities/octopus-layer-shape'
import SourceLayerGroup from '../entities/source-layer-group'
import SourceLayerShape from '../entities/source-layer-shape'
import { SourceLayer } from './create-source-layer'


export type OctopusLayer = OctopusLayerGroup | OctopusLayerShape

type CreateOctopusLayerOptions = {
  layer: SourceLayer,
  parent: OctopusLayerParent
}

function createOctopusLayerGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
  return new OctopusLayerGroup({
    parent,
    sourceLayer: layer as SourceLayerGroup
  })
}

function createOctopusLayerShape({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
  return new OctopusLayerShape({
    parent,
    sourceLayer: layer as SourceLayerShape
  })
}

export function createOctopusLayer(options: CreateOctopusLayerOptions): OctopusLayer | null {
  const type = (Object(options.layer) as SourceLayer).type
  const builders: { [key: string]: Function } = {
    group: createOctopusLayerGroup,
    shape: createOctopusLayerShape
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}

