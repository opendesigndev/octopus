import { execSync } from 'child_process'
import path from 'path'
import * as url from 'url'

import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-node.js'
import chalk from 'chalk'

export type RenderResult = {
  value: string | undefined
  error: Error | null
  time: number
}

async function render(id: string, octopusPath: string) {
  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, `render-${id}.png`)
  const fontsDir =
    process.env.FONTS_PATH ?? path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../../../../', 'fonts')
  const fontsOption = fontsDir ? `--fonts ${fontsDir}` : ''
  const ignoreValidation = process.env.ODE_IGNORE_VALIDATION === 'true' ? '--ignore-validation' : ''
  try {
    execSync(`${process.env.ODE_RENDERER_CMD} ${ignoreValidation} ${fontsOption} ${octopusPath} ${renderPath}`, {
      stdio: 'ignore',
    })
    return { value: renderPath, error: null }
  } catch (error) {
    console.error(chalk.red(`Rendering failed while processing ${octopusPath}`))
    return { value: undefined, error }
  }
}

export async function renderOctopus(id: string, octopusPath: string): Promise<RenderResult> {
  const { time, result } = await benchmarkAsync(() => render(id, octopusPath))
  return { ...result, time }
}
