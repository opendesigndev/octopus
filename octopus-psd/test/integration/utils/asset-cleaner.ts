import cloneDeep from 'lodash/cloneDeep'

import type { Manifest } from '../../../src/typings/manifest'

export function cleanManifest(_manifest?: Manifest['OctopusManifest']): Manifest['OctopusManifest'] | undefined {
  if (!_manifest) return _manifest
  const manifest = cloneDeep(_manifest)
  for (const component of manifest.components) {
    delete component.status
  }
  delete manifest.name
  return manifest
}
