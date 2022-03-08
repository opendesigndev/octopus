import path from 'path'
import { promises as fsp } from 'fs'
import { getPkgLocation } from './pkg-location'
import { execSync } from 'child_process'

export async function renderOctopus(
  id: string,
  octopusPath: string
): Promise<{ value: string | undefined; error: null | Error }> {
  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, `render-${id}.png`)
  await fsp.rename(octopusPath, path.join(octopusDir, 'octopus.json'))
  const fontsDir = path.join(await getPkgLocation(), 'fonts')
  const fontsOption = fontsDir ? `--fonts ${fontsDir}` : ''
  try {
    execSync(`${process.env.RENDERING_PATH} ${fontsOption} ${octopusDir} ${renderPath}`, { stdio: 'ignore' })
    /** @TODO rendering doesnt crash at all now? */
    await fsp.rename(path.join(octopusDir, 'octopus.json'), octopusPath)
    return {
      value: renderPath,
      error: null,
    }
  } catch (e) {
    // console.log(chalk.red(`Rendering failed while processing ${octopusPath}`))
    await fsp.rename(path.join(octopusDir, 'octopus.json'), octopusPath)
    return {
      value: undefined,
      error: e,
    }
  }
}
