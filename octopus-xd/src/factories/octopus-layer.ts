import OctopusArtboard from '../entities/octopus-artboard'
import OctopusLayerGroup from '../entities/octopus-layer-group'
import OctopusLayerShape from '../entities/octopus-layer-shape'
import SourceLayerGroup from '../entities/source-layer-group'
import SourceLayerShape from '../entities/source-layer-shape'
import { SourceLayer } from './source-layer'


export type OctopusLayer = OctopusLayerGroup | OctopusLayerShape

type CreateOctopusLayerOptions = {
  layer: SourceLayer,
  parent: OctopusArtboard | OctopusLayerGroup
}

function createOctopusLayerGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
  return new OctopusLayerGroup({
    parent,
    sourceLayerGroup: layer as SourceLayerGroup
  })
}

function createOctopusLayerShape({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
  return new OctopusLayerShape({
    parent,
    sourceLayerShape: layer as SourceLayerShape
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

