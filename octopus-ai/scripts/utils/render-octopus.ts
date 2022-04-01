import { execSync } from 'child_process'
import path from 'path'
import chalk from 'chalk'

import { getPkgLocation } from './pkg-location'

export async function renderOctopus(octopusLocation: string): Promise<string> {
  const octopusDir = path.dirname(octopusLocation)
  const renderPath = path.join(octopusDir, 'render.png')
  const fontsDir = path.join(await getPkgLocation(), 'fonts')

  const fontsOption = fontsDir ? `--fonts ${fontsDir}` : ''

  const command = `${process.env.RENDERING_PATH} ${fontsOption} ${octopusLocation} ${renderPath}`

  try {
    execSync(command)
  } catch (e) {
    console.info(chalk.red(`Rendering failed while processing command: "${command}"`))
  }

  return renderPath
}
