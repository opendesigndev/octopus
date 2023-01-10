import { getMapped } from '@opendesign/octopus-common/dist/utils/common.js'

import { SourceLayerAdjustment } from '../entities/source/source-layer-adjustment.js'
import { SourceLayerBackground } from '../entities/source/source-layer-background.js'
import { SourceLayerLayer } from '../entities/source/source-layer-layer.js'
import { SourceLayerSection } from '../entities/source/source-layer-section.js'
import { SourceLayerShape } from '../entities/source/source-layer-shape.js'
import { SourceLayerText } from '../entities/source/source-layer-text.js'
import { logger } from '../services/instances/logger.js'
import { getLayerTypeKey, isAdjustmentLayer, isShapeLayer } from '../utils/source.js'

import type { SourceLayerParent } from '../entities/source/source-layer-common'
import type {
  NodeChildWithProps,
  NodeChildWithType,
  RawLayerAdjustment,
  RawLayerBackground,
  RawLayerLayer,
  RawLayerSection,
  RawLayerShape,
  RawLayerText,
} from '../typings/raw'

export type SourceLayer =
  | SourceLayerSection
  | SourceLayerShape
  | SourceLayerText
  | SourceLayerBackground
  | SourceLayerLayer
  | SourceLayerAdjustment

type SourceLayerBuilders =
  | typeof createLayerSection
  | typeof createLayerShape
  | typeof createLayerText
  | typeof createLayerBackground
  | typeof createLayerLayer
  | typeof createLayerAdjustment

type CreateLayerOptions = {
  parent: SourceLayerParent
  layer: NodeChildWithProps | NodeChildWithType
}

const SOURCE_BUILDER_MAP: { [key: string]: SourceLayerBuilders } = {
  layerSection: createLayerSection,
  shapeLayer: createLayerShape,
  textLayer: createLayerText,
  backgroundLayer: createLayerBackground,
  layer: createLayerLayer,
  adjustmentLayer: createLayerAdjustment,
} as const

function createLayerSection({ parent, layer }: CreateLayerOptions): SourceLayerSection {
  return new SourceLayerSection({
    parent,
    rawValue: layer as RawLayerSection,
  })
}

function createLayerShape({ layer, parent }: CreateLayerOptions): SourceLayerShape {
  return new SourceLayerShape({
    parent,
    rawValue: layer as RawLayerShape,
  })
}

function createLayerText({ layer, parent }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({
    parent,
    rawValue: layer as RawLayerText,
  })
}

function createLayerBackground({ layer, parent }: CreateLayerOptions): SourceLayerBackground {
  return new SourceLayerBackground({
    parent,
    rawValue: layer as RawLayerBackground,
  })
}

function createLayerLayer({ layer, parent }: CreateLayerOptions): SourceLayerLayer {
  return new SourceLayerLayer({
    parent,
    rawValue: layer as RawLayerLayer,
  })
}

function createLayerAdjustment({ layer, parent }: CreateLayerOptions): SourceLayerAdjustment {
  return new SourceLayerAdjustment({
    parent,
    rawValue: layer as RawLayerAdjustment,
  })
}

export function getRawLayerWithType(rawLayer: NodeChildWithProps | NodeChildWithType): NodeChildWithType {
  if ('addedType' in rawLayer) {
    return rawLayer
  }

  const typeKey = getLayerTypeKey(rawLayer.layerProperties)

  if (typeKey === 'bgnd') {
    return Object.create(rawLayer, { addedType: { value: 'backgroundLayer' } }) as NodeChildWithType
  }

  if ('type' in rawLayer && rawLayer.type === 'Group') {
    return Object.create(rawLayer, { addedType: { value: 'layerSection' } })
  }

  if (rawLayer.type === 'Layer' && !(typeof rawLayer.text === 'undefined') && rawLayer.text !== null) {
    return Object.create(rawLayer, { addedType: { value: 'textLayer' } })
  }

  if (isShapeLayer(rawLayer.layerProperties)) {
    return Object.create(rawLayer, { addedType: { value: 'shapeLayer' } })
  }

  if (isAdjustmentLayer(rawLayer.layerProperties)) {
    return Object.create(rawLayer, { addedType: { value: 'adjustmentLayer' } })
  }

  return Object.create(rawLayer, { addedType: { value: 'layer' } })
}

export function createSourceLayer(options: CreateLayerOptions): SourceLayer | null {
  if (!options.layer) {
    return null
  }

  const layer = getRawLayerWithType(options.layer)
  const type = layer.addedType

  const builder = getMapped(type, SOURCE_BUILDER_MAP, undefined)

  if (typeof builder !== 'function') {
    logger.warn('createSourceLayer: Unknown layer type', { type: layer.addedType })
    return null
  }

  return builder({ ...options, layer: layer })
}
