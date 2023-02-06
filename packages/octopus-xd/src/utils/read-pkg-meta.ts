import { version as manifestSpecVersion } from '@opendesign/manifest-ts/package.json'
import { version as octopusSpecVersion } from '@opendesign/octopus-ts/package.json'

import * as pkg from '../../package.json'

export type PackageMeta = {
  name: string
  version: string
  manifestSpecVersion: string
  octopusSpecVersion: string
}

export function readPackageMeta(): PackageMeta {
  return {
    name: pkg.name,
    version: pkg.version,
    manifestSpecVersion,
    octopusSpecVersion,
  }
}
