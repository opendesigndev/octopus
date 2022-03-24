import type { OctopusLayerParent } from '../entities/octopus/octopus-layer-base'
import { OctopusLayerShape } from '../entities/octopus/octopus-layer-shape'
import { createSourceLayer, SourceLayer } from './create-source-layer'
import { OctopusLayerMaskGroup } from '../entities/octopus/octopus-layer-mask-group'
import type { RawLayerShape, RawPath } from '../typings/raw'
import type { OctopusLayer } from './create-octopus-layer'
import { SourcePath } from '../entities/source/source-path'
import { OctopusLayerShapeShapeAdapter } from '../entities/octopus/octopus-layer-shape-shape-adapter'
import type { SourceLayerShape } from '../entities/source/source-layer-shape'

type CreateOctopusLayerOptions<T> = {
  sourceLayer: SourceLayer
  octopusLayer: T
  parent: OctopusLayerParent
  path: SourcePath
}

type RawShapeMaskLayerOptions = {
  path: SourcePath
}

function createRawShapeMaskLayer({ path }: RawShapeMaskLayerOptions): RawLayerShape {
  return {
    visible: false,
    path: path.raw as RawPath,
    type: 'shapeLayer',
  }
}

function wrapWithShapeMaskLayer<T extends OctopusLayer>({
  path,
  sourceLayer,
  octopusLayer,
  parent,
}: CreateOctopusLayerOptions<T>): T | OctopusLayerMaskGroup {
  const raw = createRawShapeMaskLayer({ path })
  const maskSourceLayer = createSourceLayer({ layer: raw, parent: sourceLayer?.parent }) as SourceLayerShape
  const maskAdapter = new OctopusLayerShapeShapeAdapter({ parent, sourceLayer: maskSourceLayer })
  const mask = new OctopusLayerShape({ parent, sourceLayer, adapter: maskAdapter })
  return new OctopusLayerMaskGroup({
    parent,
    id: `${octopusLayer.id}:ShapeMask`,
    mask,
    layers: [octopusLayer],
    maskBasis: 'BODY',
  })
}

type Options<T> = {
  sourceLayer: SourceLayer
  octopusLayer: T
  parent: OctopusLayerParent
}
export function wrapWithShapeMaskLayerIfNeeded<T extends OctopusLayer>({
  sourceLayer,
  octopusLayer,
  parent,
}: Options<T>): T | OctopusLayerMaskGroup {
  const path = sourceLayer.path
  if (!path) return octopusLayer
  return wrapWithShapeMaskLayer({ path, sourceLayer, octopusLayer, parent })
}
