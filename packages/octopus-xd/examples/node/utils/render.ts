import { execSync } from 'child_process'
import path from 'path'

import { benchmarkAsync } from '@opendesign/octopus-common/utils/benchmark'

export type RenderResult = {
  value: string | undefined
  error: Error | null
  time: number
}

async function render(id: string, octopusPath: string): Promise<{ value: string | undefined; error: null | Error }> {
  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, `render-${id}.png`)
  const fontsDir = process.env.FONTS_PATH ?? path.join(__dirname, '../../../', 'fonts')
  const fontsOption = fontsDir ? `--fonts ${fontsDir}` : ''
  const ignoreValidation = process.env.RENDERING_IGNORE_VALIDATION === 'true' ? '--ignore-validation' : ''
  try {
    execSync(
      `${process.env.RENDERING_PATH} ${ignoreValidation} ${fontsOption} --bitmaps ${octopusDir} ${octopusPath} ${renderPath}`,
      {
        stdio: 'ignore',
      }
    )
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

export async function renderOctopus(id: string, octopusPath: string): Promise<RenderResult> {
  const { time, result } = await benchmarkAsync(() => render(id, octopusPath))
  return { ...result, time }
}
