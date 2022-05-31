import fromPairs from 'lodash/fromPairs'

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
