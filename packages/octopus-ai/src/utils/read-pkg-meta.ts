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
    manifestSpecVersion: pkg.dependencies['@opendesign/manifest-ts'],
    octopusSpecVersion: pkg.dependencies['@opendesign/octopus-ts'],
  }
}
