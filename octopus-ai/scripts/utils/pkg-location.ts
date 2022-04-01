import path from 'path'
import readPackageUpAsync from 'read-pkg-up'

const pkg = readPackageUpAsync({ cwd: __dirname })

export function getPkgLocation(): Promise<string> {
  return pkg.then((pkg) => {
    if (typeof pkg?.path !== 'string') {
      throw new Error("Can't find package.json and resolve workdir location")
    }

    return path.dirname(pkg?.path)
  })
}
