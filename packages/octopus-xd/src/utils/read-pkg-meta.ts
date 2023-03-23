import { version as manifestSpecVersion } from '@opendesign/manifest-ts/package.json' assert { type: 'json' }
import { version as octopusSpecVersion } from '@opendesign/octopus-ts/package.json' assert { type: 'json' }

import { version, name } from '../../package.json' assert { type: 'json' }

export type PackageMeta = {
  name: string
  version: string
  manifestSpecVersion: string
  octopusSpecVersion: string
}

export function readPackageMeta(): PackageMeta {
  return { name, version, manifestSpecVersion, octopusSpecVersion }
}
