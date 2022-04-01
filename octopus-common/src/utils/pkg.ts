import type { Options, PackageJson } from 'read-pkg-up'
import readPackageUpAsync from 'read-pkg-up'

export async function getPackageJSON(options: Options = { cwd: process.cwd() }): Promise<PackageJson> {
  const pkg = await readPackageUpAsync(options)
  if (!pkg) throw new Error(`File "package.json" not found`)
  return pkg.packageJson
}
