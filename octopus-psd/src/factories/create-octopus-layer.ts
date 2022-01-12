import { OctopusLayerParent } from '../entities/octopus-layer-common'
import OctopusLayerGroup from '../entities/octopus-layer-group'
import OctopusLayerMaskGroup from '../entities/octopus-layer-maskgroup'
import OctopusLayerShape from '../entities/octopus-layer-shape'
// import OctopusLayerText from '../entities/octopus-layer-text'
// import SourceLayerGroup from '../entities/source-layer-group'
// import SourceLayerShape from '../entities/source-layer-shape'
// import SourceLayerText from '../entities/source-layer-text'
// import { SourceLayer } from './create-source-layer'

export type OctopusLayer = OctopusLayerGroup | OctopusLayerShape | OctopusLayerMaskGroup

type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

// function createOctopusLayerGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerGroup {
//   return new OctopusLayerGroup({
//     parent,
//     sourceLayer: layer as SourceLayerGroup
//   })
// }

// function createOctopusLayerMaskGroup({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerMaskGroup {
//   return new OctopusLayerMaskGroup({
//     parent,
//     sourceLayer: layer as SourceLayerGroup
//   })
// }

// function createOctopusLayerGroupLike(options: CreateOctopusLayerOptions) {
//   return OctopusLayerMaskGroup.isMaskGroupLike(options.layer)
//     ? createOctopusLayerMaskGroup(options)
//     : createOctopusLayerGroup(options)
// }

// function createOctopusLayerShape({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
//   return new OctopusLayerShape({
//     parent,
//     sourceLayer: layer as SourceLayerShape
//   })
// }

// function createOctopusLayerText({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerText {
//   return new OctopusLayerText({
//     parent,
//     sourceLayer: layer as SourceLayerText
//   })
// }

export const createOctopusLayer = (options: CreateOctopusLayerOptions): OctopusLayer | null => {
  const type = (Object(options.layer) as SourceLayer).type
  const builders: { [key: string]: Function } = {
    // group: createOctopusLayerGroupLike,
    // shape: createOctopusLayerShape,
    // text: createOctopusLayerText
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}
