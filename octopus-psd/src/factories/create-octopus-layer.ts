import { getMapped } from '@opendesign/octopus-common/dist/utils/common'

import { OctopusLayerGroup } from '../entities/octopus/octopus-layer-group'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape'
import { OctopusLayerShapeAdjustmentAdapter } from '../entities/octopus/octopus-layer-shape-adjustment-adapter'
import { OctopusLayerShapeLayerAdapter } from '../entities/octopus/octopus-layer-shape-layer-adapter'
import { OctopusLayerShapeShapeAdapter } from '../entities/octopus/octopus-layer-shape-shape-adapter'
import { OctopusLayerText } from '../entities/octopus/octopus-layer-text'
import { logger } from '../services/instances/logger'

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
  | typeof createOctopusLayerShapeFromAdjustmentAdapter
  | typeof createOctopusLayerShapeFromLayerAdapter
  | typeof createOctopusLayerShapeFromShapeAdapter
  | typeof createOctopusLayerText

type CreateOctopusLayerOptions = {
  layer: SourceLayer
  parent: OctopusLayerParent
}

const OCTOPUS_BUILDER_MAP: { [key: string]: { builder: OctopusLayerBuilders; shouldCheckShapeMask: boolean } } = {
  layerSection: {
    builder: createOctopusLayerGroup,
    shouldCheckShapeMask: true,
  },
  shapeLayer: {
    builder: createOctopusLayerShapeFromShapeAdapter,
    shouldCheckShapeMask: false,
  },
  textLayer: {
    builder: createOctopusLayerText,
    shouldCheckShapeMask: true,
  },
  layer: {
    builder: createOctopusLayerShapeFromLayerAdapter,
    shouldCheckShapeMask: true,
  },
  backgroundLayer: {
    builder: createOctopusLayerShapeFromLayerAdapter,
    shouldCheckShapeMask: true,
  },
  adjustmentLayer: {
    builder: createOctopusLayerShapeFromAdjustmentAdapter,
    shouldCheckShapeMask: false,
  },
} as const

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

function createOctopusLayerShapeFromAdjustmentAdapter({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerShape {
  const sourceLayer = layer as SourceLayerAdjustment
  const adapter = new OctopusLayerShapeAdjustmentAdapter({ parent, sourceLayer })
  return new OctopusLayerShape({ parent, sourceLayer, adapter })
}

function createOctopusLayerText({ layer, parent }: CreateOctopusLayerOptions): OctopusLayerText {
  const sourceLayer = layer as SourceLayerText
  return new OctopusLayerText({ parent, sourceLayer })
}

export function createOctopusLayer(options: CreateOctopusLayerOptions): OctopusLayer | null {
  const type = options.layer.type
  const result = getMapped(type, OCTOPUS_BUILDER_MAP, undefined)
  if (!result) {
    logger.warn('createOctopusLayer: Unknown layer type', { type })
    return null
  }
  const { builder, shouldCheckShapeMask } = result
  const octopusLayer = builder(options)

  const sourceLayer = options.layer
  const parent = options.parent

  const wrapped = OctopusLayerMaskGroup.wrapWithBitmapMaskIfNeeded({ sourceLayer, octopusLayer, parent })
  return shouldCheckShapeMask
    ? OctopusLayerMaskGroup.wrapWithShapeMaskIfNeeded({ sourceLayer, octopusLayer: wrapped, parent })
    : wrapped
}

export function createOctopusLayers(layers: SourceLayer[], parent: OctopusLayerParent): OctopusLayer[] {
  let clippedLayers: OctopusLayer[] = []
  return layers.reduce((layers, sourceLayer) => {
    const octopusLayer = createOctopusLayer({ parent, layer: sourceLayer })

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
