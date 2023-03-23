import * as manifestJSON from '@opendesign/manifest-ts/package.json' assert { type: 'json' }
import * as octopusJSON from '@opendesign/octopus-ts/package.json' assert { type: 'json' }

import * as pkgJSON from '../../package.json' assert { type: 'json' }

type PkgMeta = {
  version: string
  name: string
}

export type PackageMeta = {
  name: string
  version: string
  manifestSpecVersion: string
  octopusSpecVersion: string
}

export function readPackageMeta(): PackageMeta {
  const manifestSpecVersion = (manifestJSON as unknown as PkgMeta).version
  const octopusSpecVersion = (octopusJSON as unknown as PkgMeta).version
  const { name, version } = pkgJSON as unknown as PkgMeta
  return { name, version, manifestSpecVersion, octopusSpecVersion }
}
