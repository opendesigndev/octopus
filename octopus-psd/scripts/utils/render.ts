import path from 'path'
import { getPkgLocation } from './pkg-location'
import { execSync } from 'child_process'
import chalk from 'chalk'
import { benchmark } from '@avocode/octopus-common/dist/utils/async'

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
    console.log(chalk.red(`Rendering failed while processing ${octopusPath}`))
    return { value: undefined, error }
  }
}

export async function renderOctopus(id: string, octopusPath: string): Promise<RenderResult> {
  const { time, result } = await benchmark(() => render(id, octopusPath))
  return { ...result, time }
}
