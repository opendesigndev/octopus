import * as pkg from '../../package.json'

export default function readPackageMeta() {
  return {
    name: pkg.name,
    version: pkg.version,
  }
}
