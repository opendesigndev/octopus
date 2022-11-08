import * as pkg from '../../package.json'

export type ProjectPackage = {
  name: string
  version: string
}

export function readPackageMeta(): ProjectPackage {
  return {
    name: pkg.name,
    version: pkg.version,
  }
}
