import crc32 from 'crc-32'
import isObject from 'lodash/isObject'
import pick from 'lodash/pick'

import { SourceLayerXObjectForm } from '../entities/source/source-layer-x-object-form'

import type { SourceLayerParent } from '../entities/source/source-layer-common'
import type { SourceLayerShape } from '../entities/source/source-layer-shape'
import type { SourceLayerShapeSubPath } from '../entities/source/source-layer-shape-subpath'
import type { SourceLayer } from '../factories/create-source-layer'
import type { RawResourcesExtGStateSmask, RawResourcesXObject } from '../typings/raw'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

export function initClippingMask(layer: SourceLayer): Nullish<SourceLayerShape> {
  if (!('clippingPaths' in layer)) {
    return
  }

  if (layer.type === 'Shading' || !layer.clippingPaths || !layer.clippingPaths.length) {
    return
  }

  const mask = layer.clippingPaths.reduce((mask, clippingPath) => {
    mask.setSubpaths([...mask.subpaths, ...clippingPath.subpaths])
    return mask
  })

  return mask
}

type CreateSoftMaskOptions = {
  sMask: Nullish<RawResourcesExtGStateSmask>
  parent: SourceLayerParent
}

export function createSoftMask({ sMask, parent }: CreateSoftMaskOptions): Nullish<SourceLayerXObjectForm> {
  const g = sMask?.G

  if (!g) {
    return null
  }

  const subType = 'Subtype' in g ? g.Subtype : ''

  if (subType !== 'Form') {
    return null
  }

  const rawSourceXObject = g as RawResourcesXObject

  if (!rawSourceXObject) {
    return null
  }

  return new SourceLayerXObjectForm({ parent, rawValue: rawSourceXObject })
}

export function hashOf(value: unknown): string {
  const hash = crc32.str(JSON.stringify(value))
  const beautified = (hash - (1 << 31)).toString(16)
  return beautified
}

const compare = (() => {
  const collator = new Intl.Collator('en-US')
  return (a: string, b: string) => collator.compare(a, b)
})()

export function hashOfObjectSeed(seed: Array<[string, unknown]>): string {
  return hashOf(seed.slice().sort((a, b) => compare(String(a[0]), String(b[0]))))
}

export function hashOfArraySeed(seed: Array<unknown>): string {
  return hashOf(seed.slice())
}

export function hashAny(value: unknown): string {
  if (Array.isArray(value)) return hashArray(value)
  if (isObject(value)) return hashObject(value as Record<string, unknown>)
  return JSON.stringify(value)
}

export function hashArray(arr: Array<unknown>): string {
  return hashOfArraySeed(arr.map((value) => `hash(${hashAny(value)})`))
}

export function hashObject(obj: { [key: string]: unknown }): string {
  return hashOfObjectSeed(Object.entries(obj).map(([key, value]) => [key, hashAny(value)]))
}

function normalizeSubPath(
  subPath: SourceLayerShapeSubPath
): Pick<SourceLayerShapeSubPath, 'type' | 'coords' | 'closed' | 'points'> {
  return {
    points: subPath.points.map((point) => pick(point, 'Type', 'Coords')),
    ...pick(subPath, 'type', 'coords', 'closed'),
  }
}

function normalizeSubPaths(subPaths: SourceLayerShapeSubPath[]) {
  return subPaths.map((subPath) => normalizeSubPath(subPath))
}

function normalizeMask(mask: SourceLayerShape) {
  return {
    transformMatrix: mask.transformMatrix,
    subpaths: normalizeSubPaths(mask.subpaths),
  }
}

export function getMaskGroupHashKey(mask: SourceLayerShape): string {
  return hashAny(normalizeMask(mask))
}
