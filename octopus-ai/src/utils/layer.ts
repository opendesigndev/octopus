import { asArray } from '@avocode/octopus-common/dist/utils/as'

import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

type InitSourceLayerChildrenOptions<T, K, U> = {
  layers: Nullable<T[]>
  parent: K
  builder: (builderOptions: { layer: T; parent: K }) => U
}

export function initChildLayers<T, K, U>({ layers, parent, builder }: InitSourceLayerChildrenOptions<T, K, U>): U[] {
  const children = asArray(layers)

  return children.reduce<U[]>((children: U[], layer: T) => {
    const childLayer = builder({
      layer,
      parent,
    })
    return childLayer ? [...children, childLayer] : children
  }, [])
}
