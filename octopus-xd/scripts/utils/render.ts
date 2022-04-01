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
  const fontsDir = path.join(await getPkgLocation(), 'fonts')
  const fontsOption = fontsDir ? `--fonts ${fontsDir}` : ''
  try {
    execSync(`${process.env.RENDERING_PATH} ${fontsOption} --bitmaps ${octopusDir} ${octopusPath} ${renderPath}`, {
      stdio: 'ignore',
    })
    return {
      value: renderPath,
      error: null,
    }
  } catch (e) {
    await fsp.rename(path.join(octopusDir, 'octopus.json'), octopusPath)
    return {
      value: undefined,
      error: e,
    }
  }
}
