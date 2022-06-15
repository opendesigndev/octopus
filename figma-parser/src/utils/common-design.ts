import fromPairs from 'lodash/fromPairs'

import { isObject } from './common'

export function getChildren<U extends { children: unknown[] }>(struct: U): U['children']
export function getChildren<T>(struct: Record<PropertyKey, unknown>, childrenProp: string): T[]
export function getChildren<T>(struct: Record<PropertyKey, unknown>, childrenProp = 'children'): T[] {
  if (childrenProp in struct) return struct[childrenProp] as T[]
  return []
}

function _flattenLayers<T extends Record<PropertyKey, unknown>>(superNode: T, childrenProp = 'children'): T[] {
  const children = getChildren<T>(superNode, childrenProp)
  return [
    superNode,
    ...children.reduce<T[]>((subs, child) => {
      subs.push(..._flattenLayers<T>(child, childrenProp))
      return subs
    }, []),
  ]
}

export function flattenLayers<T extends Record<PropertyKey, unknown>>(
  superNode: Record<PropertyKey, unknown>,
  childrenProp = 'children'
): T[] {
  const children = getChildren<T>(superNode, childrenProp)
  return [
    ...children.reduce<T[]>((subs, child) => {
      subs.push(..._flattenLayers<T>(child, childrenProp))
      return subs
    }, []),
  ]
}

function _buildParentsMap<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>>(
  superNode: T,
  childrenProp = 'children',
  parent: T | U
): [T, T | U][] {
  const children = getChildren<T>(superNode, childrenProp)
  return [
    [superNode, parent],
    ...children.reduce<[T, T | U][]>((subs, child) => {
      subs.push(..._buildParentsMap<T, U>(child, childrenProp, superNode))
      return subs
    }, []),
  ]
}

export function buildParentsMap<E extends Record<PropertyKey, unknown>, P extends Record<PropertyKey, unknown>>(
  superNode: P,
  childrenProp = 'children'
): [E, E | P][] {
  const children = getChildren<E>(superNode, childrenProp)
  return [
    ...children.reduce<[E, E | P][]>((subs, child) => {
      subs.push(..._buildParentsMap<E, P>(child, childrenProp, superNode))
      return subs
    }, []),
  ]
}

export function getVariantPropsFromName(variantName: string): Record<string, string> {
  return fromPairs(
    String(variantName)
      .split(',')
      .map((pair) => {
        return String(pair)
          .split('=')
          .map((str) => str.trim())
          .slice(0, 2)
      })
  )
}

// eslint-disable-next-line @typescript-eslint/ban-types
function _traverseAndFindRecursive<T>(node: unknown, cb: Function): T[] {
  return [
    cb(node),
    ...Object.values(node as Record<string, unknown>).reduce<T[]>((results, value) => {
      if (!isObject(value)) return results
      return [...results, ..._traverseAndFindRecursive<T>(value, cb)]
    }, []),
  ]
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function traverseAndFind<T>(node: Record<string, unknown>, cb: Function): T[] {
  return _traverseAndFindRecursive<T>(node, cb).filter((result) => result !== undefined)
}
