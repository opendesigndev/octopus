import { asArray } from '@avocode/octopus-common/dist/utils/as'

import type { RawLayer } from '../typings/source'

const GROUP_LIKE_TYPES = ['artboard', 'group']

function isGroup(layer: unknown): boolean {
  return GROUP_LIKE_TYPES.includes((layer as Record<string, 'type'>)?.type)
}

export function childrenOf(layer: unknown, includeShapes = false): RawLayer[] {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const children = layer?.[layer?.type]?.children
  if (Array.isArray(children)) {
    return children
  }

  if (includeShapes) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const shapeChildren = layer?.shape?.children
    if (Array.isArray(shapeChildren)) {
      return shapeChildren
    }
  }

  return []
}

export function flattenLayers(layer: unknown, includeShapes = false, includeStates = false): RawLayer[] {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const hasSubshapes = includeShapes ? Boolean(layer?.shape?.children?.length) : false

  const hasLayers = Boolean(isGroup(layer) && childrenOf(layer).length)

  const hasDescendants = hasLayers || hasSubshapes

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const itselves = includeStates ? [layer, ...asArray(layer?.meta?.ux?.states)] : [layer]

  if (!hasDescendants) return itselves

  return [
    ...itselves,
    ...itselves.reduce((children, layer) => {
      return [
        ...children,
        ...childrenOf(layer, includeShapes).reduce((children, child) => {
          return [...children, ...flattenLayers(child, includeShapes, includeStates)]
        }, []),
      ]
    }, []),
  ]
}
