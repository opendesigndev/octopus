import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

import SourceArtboard from '../entities/source/source-artboard'
import type { SourceLayerParent } from '../entities/source/source-layer-common'
import SourceLayerGroup from '../entities/source/source-layer-group'
import SourceLayerShape from '../entities/source/source-layer-shape'
import SourceLayerText from '../entities/source/source-layer-text'
import SourceLayerXObjectImage from '../entities/source/source-layer-x-object-image'
import type { RawGroupLayer, RawTextLayer } from '../typings/raw'
import type { RawLayer } from '../typings/raw/layer'
import type { RawShapeLayer } from '../typings/raw/shape-layer'
import type { RawXObjectLayer } from '../typings/raw/x-object'

export type SourceLayer = SourceLayerGroup | SourceLayerText | SourceLayerShape | SourceLayerXObjectImage

type Builder = (options: CreateLayerOptions) => SourceLayer | null

type CreateLayerOptions = {
  layer: RawLayer
  parent: SourceLayerParent
  path: number[]
}

function createSourceLayerXObjectImage({ layer, parent, path }: CreateLayerOptions): SourceLayerXObjectImage {
  return new SourceLayerXObjectImage({
    rawValue: layer as RawXObjectLayer,
    parent,
    path,
  })
}

function createFormOptions({ layer, parent, path }: CreateLayerOptions): CreateLayerOptions {
  const parentArtboard = parent instanceof SourceArtboard ? parent : parent.parentArtboard
  const xObjectName = (layer as RawXObjectLayer).Name ?? ''
  const resourcesXObject = parentArtboard?.getResourcesXObject(xObjectName)

  const bBox = resourcesXObject?.BBox
  const resources = { ...resourcesXObject?.resources, BBox: bBox }
  const rawParentArtboard = { ...parentArtboard?.raw, Resources: { ...resources } }
  const artboardId = `${xObjectName}-${path}`

  const rawGroupLayer: RawGroupLayer = {
    Type: 'MarkedContext',
    Kids: Array.isArray(resourcesXObject?.data) ? resourcesXObject?.data : [],
  }

  return { layer: rawGroupLayer, parent: new SourceArtboard(rawParentArtboard, artboardId), path }
}

function createXObject({ layer, parent, path }: CreateLayerOptions): SourceLayerXObjectImage | SourceLayerGroup | null {
  const xObjectName = (layer as RawXObjectLayer).Name

  if (!xObjectName) {
    return null
  }

  const parentArtboard = parent instanceof SourceArtboard ? parent : parent.parentArtboard
  const subType = parentArtboard?.getResourcesXObjectSubtype(xObjectName)

  if (subType === 'Image') {
    return createSourceLayerXObjectImage({ layer, parent, path })
  }

  if (subType === 'Form') {
    const options = createFormOptions({ layer, parent, path })
    return createSourceLayerGroup(options)
  }

  return null
}

function createSourceLayerGroup({ layer, parent, path }: CreateLayerOptions): SourceLayerGroup {
  return new SourceLayerGroup({
    parent,
    rawValue: layer as RawGroupLayer,
    path,
  })
}

export function createSourceLayerShape({ layer, parent, path }: CreateLayerOptions): SourceLayerShape {
  return new SourceLayerShape({
    parent,
    path,
    rawValue: layer as RawShapeLayer,
  })
}

export function createSourceLayerText({ layer, parent, path }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({
    parent,
    rawValue: layer as RawTextLayer,
    path,
  })
}

export function createSourceLayer(options: CreateLayerOptions): Nullable<SourceLayer> {
  const type = (Object(options.layer) as RawLayer).Type

  const builders: { [key: string]: Builder } = {
    Path: createSourceLayerShape,
    TextGroup: createSourceLayerText,
    MarkedContext: createSourceLayerGroup,
    Shading: createSourceLayerShape,
    XObject: createXObject,
  }
  const builder = builders[type as string]
  return typeof builder === 'function' ? builder(options) : null
}
