import cloneDeep from 'lodash/cloneDeep'

import type { Manifest } from '../../../../src/typings/manifest'

export function cleanManifest(input?: Manifest['OctopusManifest']): Manifest['OctopusManifest'] | undefined {
  if (!input) return undefined
  const manifest = cloneDeep(input)
  for (const component of manifest.components) {
    delete component.status
  }
  return manifest
}
