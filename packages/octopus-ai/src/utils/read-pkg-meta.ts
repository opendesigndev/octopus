import { version as manifestSpecVersion } from '@opendesign/manifest-ts/package.json'
import { version as octopusSpecVersion } from '@opendesign/octopus-ts/package.json'

import { name, version } from '../../package.json'

export type PackageMeta = {
  name: string
  version: string
  manifestSpecVersion: string
  octopusSpecVersion: string
}

export function readPackageMeta(): PackageMeta {
  return { name, version, manifestSpecVersion, octopusSpecVersion }
}
