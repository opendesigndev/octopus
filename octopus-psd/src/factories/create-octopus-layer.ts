import type { OctopusLayerParent } from '../entities/octopus/octopus-layer-base'
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
import { SourceLayer } from './create-source-layer'
import { logWarn } from '../services/instances/misc'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import { wrapWithBitmapMaskLayerIfNeeded } from './mask-bitmap-layer'
import { wrapWithShapeMaskLayerIfNeeded } from './mask-shape-layer'

export type OctopusLayer = OctopusLayerGroup | OctopusLayerMaskGroup | OctopusLayerText | OctopusLayerShape

type OctopusLayerBuilders =
  | typeof createOctopusLayerGroup
  | typeof createOctopusLayerShapeFromShapeAdapter
  | typeof createOctopusLayerText
  | typeof createOctopusLayerShapeFromLayerAdapter

type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

function createOctopusLayerGroup({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerGroup | OctopusLayerMaskGroup {
  const sourceLayer = layer as SourceLayerSection
  const octopusLayer = new OctopusLayerGroup({ parent, sourceLayer })

  const wrapped = wrapWithBitmapMaskLayerIfNeeded({ sourceLayer, octopusLayer, parent })
  return wrapWithShapeMaskLayerIfNeeded({ sourceLayer, octopusLayer: wrapped, parent })
}

function createOctopusLayerShapeFromShapeAdapter({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape | OctopusLayerMaskGroup {
  const sourceLayer = layer as SourceLayerShape
  const adapter = new OctopusLayerShapeShapeAdapter({ parent, sourceLayer })
  const octopusLayer = new OctopusLayerShape({ parent, sourceLayer, adapter })

  return wrapWithBitmapMaskLayerIfNeeded({ sourceLayer, octopusLayer, parent })
}

function createOctopusLayerShapeFromLayerAdapter({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape | OctopusLayerMaskGroup {
  const sourceLayer = layer as SourceLayerLayer
  const adapter = new OctopusLayerShapeLayerAdapter({ parent, sourceLayer })
  const octopusLayer = new OctopusLayerShape({ parent, sourceLayer, adapter })

  const wrapped = wrapWithBitmapMaskLayerIfNeeded({ sourceLayer, octopusLayer, parent })
  return wrapWithShapeMaskLayerIfNeeded({ sourceLayer, octopusLayer: wrapped, parent })
}

function createOctopusLayerText({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerText | OctopusLayerMaskGroup {
  const sourceLayer = layer as SourceLayerText
  const octopusLayer = new OctopusLayerText({ parent, sourceLayer })

  const wrapped = wrapWithBitmapMaskLayerIfNeeded({ sourceLayer, octopusLayer, parent })
  return wrapWithShapeMaskLayerIfNeeded({ sourceLayer, octopusLayer: wrapped, parent })
}

const OCTOPUS_BUILDER_MAP: { [key: string]: OctopusLayerBuilders } = {
  layerSection: createOctopusLayerGroup,
  shapeLayer: createOctopusLayerShapeFromShapeAdapter,
  textLayer: createOctopusLayerText,
  layer: createOctopusLayerShapeFromLayerAdapter,
  backgroundLayer: createOctopusLayerShapeFromLayerAdapter,
  //adjustmentLayer: TODO, // TODO
} as const

function createOctopusLayer(options: CreateOctopusLayerOptions): OctopusLayer | null {
  const type = (Object(options.layer) as SourceLayer).type
  const builder = getMapped(type, OCTOPUS_BUILDER_MAP, undefined)
  if (typeof builder !== 'function') {
    logWarn('createOctopusLayer: Unknown layer type', { type })
    return null
  }
  return builder(options)
}

export function createOctopusLayers(layers: SourceLayer[], parent: OctopusLayerParent): OctopusLayer[] {
  return layers.reduce((layers, sourceLayer) => {
    const octopusLayer = createOctopusLayer({
      parent,
      layer: sourceLayer,
    })
    return octopusLayer ? [octopusLayer, ...layers] : layers
  }, [])
}
