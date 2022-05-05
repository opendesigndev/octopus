import { execSync } from 'child_process'
import path from 'path'

import { benchmarkAsync } from '@avocode/octopus-common/dist/utils/benchmark'
import chalk from 'chalk'

import { getPkgLocation } from './pkg-location'

export type RenderResult = {
  value: string | undefined
  error: Error | null
  time: number
}

async function render(id: string, octopusPath: string) {
  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, 'render.png')
  const fontsDir = process.env.FONTS_PATH ?? path.join(await getPkgLocation(), 'fonts')
  const fontsOption = fontsDir ? `--fonts ${fontsDir}` : ''
  try {
    execSync(`${process.env.RENDERING_PATH} ${fontsOption} ${octopusDir} ${renderPath}`, { stdio: 'ignore' })
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
