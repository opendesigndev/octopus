import cloneDeep from 'lodash/cloneDeep.js'

import type { Manifest } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

export function cleanManifest(input?: Manifest['OctopusManifest']): Manifest['OctopusManifest'] | undefined {
  if (!input) return undefined
  const manifest = cloneDeep(input)
  for (const component of manifest.components) {
    delete component.status
  }
  delete manifest.name
  return manifest
}
