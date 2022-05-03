import { execSync } from 'child_process'
import path from 'path'

import { getPkgLocation } from './pkg-location'

export async function renderOctopus(
  id: string,
  octopusPath: string
): Promise<{ value: string | undefined; error: null | Error }> {
  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, `render-${id}.png`)
  const fontsDir = process.env.FONTS_PATH ?? path.join(await getPkgLocation(), 'fonts')
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
    return {
      value: undefined,
      error: e,
    }
  }
}
