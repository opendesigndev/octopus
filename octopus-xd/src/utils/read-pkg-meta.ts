import * as pkg from '../../package.json'

export function readPackageMeta() {
  return {
    name: pkg.name,
    version: pkg.version,
  }
}
