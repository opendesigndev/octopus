import { SourceLayerGroup } from '../entities/source/source-layer-group'
import { SourceLayerShape } from '../entities/source/source-layer-shape'
import { SourceLayerText } from '../entities/source/source-layer-text'
import { SourceLayerXObjectForm } from '../entities/source/source-layer-x-object-form'
import { SourceLayerXObjectImage } from '../entities/source/source-layer-x-object-image'

import type { SourceLayerParent } from '../entities/source/source-layer-common'
import type { RawGroupLayer, RawResourcesXObject, RawTextLayer } from '../typings/raw'
import type { RawLayer } from '../typings/raw/layer'
import type { RawShapeLayer } from '../typings/raw/shape-layer'
import type { RawXObjectLayer } from '../typings/raw/x-object'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

export type SourceLayer =
  | SourceLayerGroup
  | SourceLayerText
  | SourceLayerShape
  | SourceLayerXObjectForm
  | SourceLayerXObjectImage

type Builder = (options: CreateLayerOptions) => Nullish<SourceLayer>

type CreateLayerOptions = {
  layer: RawLayer
  parent: SourceLayerParent
}

type CreateXObjectFormOptions = CreateLayerOptions & { rawXObject?: RawXObjectLayer }
type CreateXObjectImageOptions = Required<CreateXObjectFormOptions>

function createSourceLayerGroup({ layer, parent }: CreateLayerOptions): SourceLayerGroup {
  return new SourceLayerGroup({
    parent,
    rawValue: layer as RawGroupLayer,
  })
}

function createSourceLayerXObjectImage({
  layer,
  parent,
  rawXObject,
}: CreateXObjectImageOptions): SourceLayerXObjectImage {
  return new SourceLayerXObjectImage({ rawValue: layer as RawResourcesXObject, parent, xObject: rawXObject })
}

export function createSourceLayerXObjectForm({
  layer,
  parent,
  rawXObject,
}: CreateXObjectFormOptions): SourceLayerXObjectForm {
  return new SourceLayerXObjectForm({ rawValue: layer as RawResourcesXObject, parent, xObject: rawXObject })
}

function createXObject({ layer, parent }: CreateLayerOptions): SourceLayerXObjectForm | SourceLayerXObjectImage | null {
  const xObjectName = (layer as RawXObjectLayer).Name

  if (!xObjectName) {
    return null
  }

  const resourcesXObject = parent.resources?.getXObjectByName(xObjectName)

  if (!resourcesXObject) {
    return null
  }

  const subtype = resourcesXObject?.Subtype

  if (subtype === 'Image') {
    return createSourceLayerXObjectImage({ layer: resourcesXObject, parent, rawXObject: layer as RawXObjectLayer })
  }

  if (subtype === 'Form') {
    return createSourceLayerXObjectForm({ layer: resourcesXObject, parent, rawXObject: layer as RawXObjectLayer })
  }

  return null
}

export function createSourceLayerShape({ layer, parent }: CreateLayerOptions): SourceLayerShape {
  return new SourceLayerShape({
    parent,
    rawValue: layer as RawShapeLayer,
  })
}

export function createSourceLayerText({ layer, parent }: CreateLayerOptions): SourceLayerText {
  return new SourceLayerText({
    parent,
    rawValue: layer as RawTextLayer,
  })
}

export function createSourceLayer(options: CreateLayerOptions): Nullish<SourceLayer> {
  const rawLayer = Object(options.layer) as RawLayer
  const type = rawLayer.Type

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
