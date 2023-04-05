import manifestJSON from '@opendesign/manifest-ts/package.json' assert { type: 'json' }
import octopusJSON from '@opendesign/octopus-ts/package.json' assert { type: 'json' }

import pkgJSON from '../../package.json' assert { type: 'json' }

export type PackageMeta = {
  name: string
  version: string
  manifestSpecVersion: string
  octopusSpecVersion: string
}

export function readPackageMeta(): PackageMeta {
  const manifestSpecVersion = manifestJSON.version
  const octopusSpecVersion = octopusJSON.version
  const { name, version } = pkgJSON
  return { name, version, manifestSpecVersion, octopusSpecVersion }
}
