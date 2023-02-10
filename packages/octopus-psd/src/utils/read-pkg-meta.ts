import manifestPkg from '@opendesign/manifest-ts/package.json'
import octopusPkg from '@opendesign/octopus-ts/package.json'

import pkg from '../../package.json'

export type PackageMeta = {
  name: string
  version: string
  manifestSpecVersion: string
  octopusSpecVersion: string
}

export function readPackageMeta(): PackageMeta {
  const { name, version } = pkg
  const manifestSpecVersion = manifestPkg.version
  const octopusSpecVersion = octopusPkg.version
  return { name, version, manifestSpecVersion, octopusSpecVersion }
}
