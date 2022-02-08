import { asArray } from '@avocode/octopus-common/dist/utils/as'

import type { RawLayer } from '../typings/source'


const GROUP_LIKE_TYPES = ['artboard', 'group']

function isGroup(layer: any): boolean {
  return GROUP_LIKE_TYPES.includes(layer?.type)
}

export function childrenOf(layer: any, includeShapes: boolean = false): RawLayer[] {
  const children = layer?.[layer?.type]?.children
  if (Array.isArray(children)) {
    return children
  }

  if (includeShapes) {
    const shapeChildren = layer?.shape?.children
    if (Array.isArray(shapeChildren)) {
      return shapeChildren
    }
  }

  return []
}

export function flattenLayers(
  layer: any,
  includeShapes: boolean = false,
  includeStates: boolean = false
): RawLayer[] {
  const hasSubshapes = includeShapes
    ? Boolean(layer?.shape?.children?.length)
    : false

  const hasLayers = Boolean(isGroup(layer) && childrenOf(layer).length)

  const hasDescendants = hasLayers || hasSubshapes

  const itselves = includeStates
    ? [layer, ...asArray(layer?.meta?.ux?.states)]
    : [layer]

  if (!hasDescendants) return itselves

  return [...itselves, ...itselves.reduce((children, layer) => {
    return [...children, ...childrenOf(layer, includeShapes).reduce((children, child) => {
      return [...children, ...flattenLayers(child, includeShapes, includeStates)]
    }, [])]
  }, [])]
}