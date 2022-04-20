import { execSync } from 'child_process'
import path from 'path'

import chalk from 'chalk'

export function renderOctopus(octopusLocation: string): string {
  const octopusDir = path.dirname(octopusLocation)
  const renderPath = path.join(octopusDir, 'render.png')
  const command = `${process.env.RENDERING_PATH} ${octopusLocation} ${renderPath}`

  try {
    execSync(command)
  } catch (e) {
    console.info(chalk.red(`Rendering failed while processing command: "${command}"`))
  }

  return renderPath
}
