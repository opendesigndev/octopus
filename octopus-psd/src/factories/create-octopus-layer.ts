import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape'
import { OctopusLayerShapeAdjustmentAdapter } from '../entities/octopus/octopus-layer-shape-adjustment-adapter'
import { OctopusLayerShapeLayerAdapter } from '../entities/octopus/octopus-layer-shape-layer-adapter'
import { OctopusLayerShapeShapeAdapter } from '../entities/octopus/octopus-layer-shape-shape-adapter'
import { OctopusLayerText } from '../entities/octopus/octopus-layer-text'
import { logWarn } from '../services/instances/misc'

import type { OctopusLayerParent } from '../entities/octopus/octopus-layer-base'
import type { SourceLayerAdjustment } from '../entities/source/source-layer-adjustment'
import type { SourceLayerLayer } from '../entities/source/source-layer-layer'
import type { SourceLayerSection } from '../entities/source/source-layer-section'
import type { SourceLayerShape } from '../entities/source/source-layer-shape'
import type { SourceLayerText } from '../entities/source/source-layer-text'
import type { SourceLayer } from './create-source-layer'

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

const OCTOPUS_BUILDER_MAP: { [key: string]: OctopusLayerBuilders } = {
  layerSection: createOctopusLayerGroup,
  shapeLayer: createOctopusLayerShapeFromShapeAdapter,
  textLayer: createOctopusLayerText,
  layer: createOctopusLayerShapeFromLayerAdapter,
  backgroundLayer: createOctopusLayerShapeFromLayerAdapter,
  adjustmentLayer: createOctopusLayerShapeFromAdjustmentAdapter,
} as const

function createOctopusLayerGroup({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerGroup | OctopusLayerMaskGroup {
  const sourceLayer = layer as SourceLayerSection
  const octopusLayer = new OctopusLayerGroup({ parent, sourceLayer })

  const wrapped = OctopusLayerMaskGroup.wrapWithBitmapMaskIfNeeded({ sourceLayer, octopusLayer, parent })
  return OctopusLayerMaskGroup.wrapWithShapeMaskIfNeeded({ sourceLayer, octopusLayer: wrapped, parent })
}

function createOctopusLayerShapeFromShapeAdapter({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape | OctopusLayerMaskGroup {
  const sourceLayer = layer as SourceLayerShape
  const adapter = new OctopusLayerShapeShapeAdapter({ parent, sourceLayer })
  const octopusLayer = new OctopusLayerShape({ parent, sourceLayer, adapter })

  return OctopusLayerMaskGroup.wrapWithBitmapMaskIfNeeded({ sourceLayer, octopusLayer, parent })
}

function createOctopusLayerShapeFromLayerAdapter({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape | OctopusLayerMaskGroup {
  const sourceLayer = layer as SourceLayerLayer
  const adapter = new OctopusLayerShapeLayerAdapter({ parent, sourceLayer })
  const octopusLayer = new OctopusLayerShape({ parent, sourceLayer, adapter })

  const wrapped = OctopusLayerMaskGroup.wrapWithBitmapMaskIfNeeded({ sourceLayer, octopusLayer, parent })
  return OctopusLayerMaskGroup.wrapWithShapeMaskIfNeeded({ sourceLayer, octopusLayer: wrapped, parent })
}

function createOctopusLayerShapeFromAdjustmentAdapter({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerShape | OctopusLayerMaskGroup {
  const sourceLayer = layer as SourceLayerAdjustment
  const adapter = new OctopusLayerShapeAdjustmentAdapter({ parent, sourceLayer })
  const octopusLayer = new OctopusLayerShape({ parent, sourceLayer, adapter })

  return OctopusLayerMaskGroup.wrapWithBitmapMaskIfNeeded({ sourceLayer, octopusLayer, parent })
}

function createOctopusLayerText({
  layer,
  parent,
}: CreateOctopusLayerOptions): OctopusLayerText | OctopusLayerMaskGroup {
  const sourceLayer = layer as SourceLayerText
  const octopusLayer = new OctopusLayerText({ parent, sourceLayer })

  const wrapped = OctopusLayerMaskGroup.wrapWithBitmapMaskIfNeeded({ sourceLayer, octopusLayer, parent })
  return OctopusLayerMaskGroup.wrapWithShapeMaskIfNeeded({ sourceLayer, octopusLayer: wrapped, parent })
}

export function createOctopusLayer(options: CreateOctopusLayerOptions): OctopusLayer | null {
  const type = options.layer.type
  const builder = getMapped(type, OCTOPUS_BUILDER_MAP, undefined)
  if (typeof builder !== 'function') {
    logWarn('createOctopusLayer: Unknown layer type', { type })
    return null
  }
  return builder(options)
}

export function createOctopusLayers(layers: SourceLayer[], parent: OctopusLayerParent): OctopusLayer[] {
  let clippedLayers: OctopusLayer[] = []
  return layers.reduce((layers, sourceLayer) => {
    const octopusLayer = createOctopusLayer({
      parent,
      layer: sourceLayer,
    })

    if (!octopusLayer) return layers

    if (sourceLayer.clipped) {
      clippedLayers.push(octopusLayer)
      return layers
    }

    if (clippedLayers.length > 0) {
      const clippingMask = OctopusLayerMaskGroup.createClippingMask({
        parent,
        mask: octopusLayer,
        layers: [...clippedLayers].reverse(),
      })
      clippedLayers = []
      return [clippingMask, ...layers]
    }

    return [octopusLayer, ...layers]
  }, [])
}
