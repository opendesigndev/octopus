import readPackageUpAsync from 'read-pkg-up'
import path from 'path'

const packageJson = readPackageUpAsync({ cwd: __dirname })

export function getPkgLocation() {
  return packageJson.then((pkg) => {
    if (typeof pkg?.path !== 'string') {
      throw new Error("Can't find package.json and resolve workdir location")
    }
    return path.dirname(pkg?.path)
  })
}
