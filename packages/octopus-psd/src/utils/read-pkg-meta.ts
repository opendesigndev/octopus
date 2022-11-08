import pkg from '../../package.json' assert { type: 'json' }

export function readPackageMeta() {
  return {
    name: pkg.name,
    version: pkg.version,
  }
}
