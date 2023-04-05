import { execSync } from 'child_process'
import path from 'path'

import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-node.js'
import chalk from 'chalk'
import kebabCase from 'lodash/kebabCase.js'

export type RenderResult = {
  value: string | undefined
  error: Error | null
  time: number
}

async function render(id: string, octopusPath: string) {
  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, `${kebabCase(id)}-render.png`)
  const fontsDir = process.env.FONTS_PATH ?? new URL('../../../fonts', import.meta.url).pathname
  const fontsOption = fontsDir ? `--fonts ${fontsDir}` : ''
  const ignoreValidation = process.env.ODE_IGNORE_VALIDATION === 'true' ? '--ignore-validation' : ''
  const renderCmd = `${process.env.ODE_RENDERER_CMD} ${ignoreValidation} ${fontsOption} --bitmaps ${octopusDir} ${octopusPath} ${renderPath}`
  try {
    execSync(renderCmd, { stdio: 'ignore' })
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
