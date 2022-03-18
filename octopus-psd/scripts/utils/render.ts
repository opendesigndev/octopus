import path from 'path'
import { getPkgLocation } from './pkg-location'
import { execSync } from 'child_process'
import chalk from 'chalk'

export type RenderResult = {
  value: string | undefined
  error: Error | null
  time: number
}

export async function renderOctopus(id: string, octopusPath: string): Promise<RenderResult> {
  const timeStart = performance.now()

  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, 'render.png')
  const fontsDir = process.env.FONTS_PATH ?? path.join(await getPkgLocation(), 'fonts')
  const fontsOption = fontsDir ? `--fonts ${fontsDir}` : ''

  const result: RenderResult = { value: undefined, error: null, time: 0 }
  try {
    execSync(`${process.env.RENDERING_PATH} ${fontsOption} ${octopusDir} ${renderPath}`, { stdio: 'ignore' })
    result['value'] = renderPath
  } catch (err) {
    console.log(chalk.red(`Rendering failed while processing ${octopusPath}`))
    result['error'] = err
  }
  result['time'] = performance.now() - timeStart
  return result
}
