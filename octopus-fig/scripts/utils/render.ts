import { execSync } from 'child_process'
import path from 'path'

import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark'
import chalk from 'chalk'
import kebabCase from 'lodash/kebabCase.js'

import { getPkgLocation } from './pkg-location.js'

export type RenderResult = {
  value: string | undefined
  error: Error | null
  time: number
}

async function render(id: string, octopusPath: string) {
  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, `${kebabCase(id)}-render.png`)
  const fontsDir = process.env.FONTS_PATH ?? path.join(await getPkgLocation(), 'fonts')
  const fontsOption = fontsDir ? `--fonts ${fontsDir}` : ''
  const ignoreValidation = process.env.RENDERING_IGNORE_VALIDATION === 'true' ? '--ignore-validation' : ''
  try {
    execSync(
      `${process.env.RENDERING_PATH} ${ignoreValidation} ${fontsOption} --bitmaps ${octopusDir} ${octopusPath} ${renderPath}`,
      {
        stdio: 'ignore',
      }
    )
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
