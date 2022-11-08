import { asArray } from '@opendesign/octopus-common/dist/utils/as'
import { push } from '@opendesign/octopus-common/dist/utils/common'
import get from 'lodash/get'

import type { RawArtboardEntry, RawLayer } from '../typings/source'

const GROUP_LIKE_TYPES = ['artboard', 'group']

function isGroup(layer: unknown): boolean {
  return GROUP_LIKE_TYPES.includes((layer as Record<string, 'type'>)?.type)
}

export function childrenOf(layer: RawLayer | RawArtboardEntry): RawLayer[] {
  const children = get(layer, `${layer.type}.children`) as RawLayer[] | undefined
  if (Array.isArray(children)) {
    return children
  }
  return []
}

export function flattenLayers(layer: RawLayer, includeShapes = false, includeStates = false): RawLayer[] {
  const hasSubshapes = includeShapes ? Boolean(get(layer, 'shape.children.length')) : false
  const hasLayers = Boolean(isGroup(layer) && childrenOf(layer).length)
  const hasDescendants = hasLayers || hasSubshapes
  const itselves = includeStates ? [layer, ...asArray(layer?.meta?.ux?.states)] : [layer]
  if (!hasDescendants) return itselves

  return [
    ...itselves,
    ...itselves.reduce((children, layer) => {
      return push(
        children,
        ...childrenOf(layer).reduce((children, child) => {
          return push(children, ...flattenLayers(child, includeShapes, includeStates))
        }, [])
      )
    }, []),
  ]
}
