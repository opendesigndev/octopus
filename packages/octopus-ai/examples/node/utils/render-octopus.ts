import { execSync } from 'child_process'
import path from 'path'
import * as url from 'url'

import { benchmarkAsync } from '@opendesign/octopus-common/dist/utils/benchmark-node.js'

export type RenderResult = {
  value: string | undefined
  error: Error | null
  time: number
}

async function render(id: string, octopusPath: string): Promise<{ value: string | undefined; error: null | Error }> {
  const octopusDir = path.dirname(octopusPath)
  const renderPath = path.join(octopusDir, `render-${id}.png`)

  const fontsDir =
    process.env.FONTS_PATH ?? path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../../../fonts')
  const fontsOption = `--fonts ${fontsDir}`

  const ignoreValidation = process.env.ODE_IGNORE_VALIDATION === 'true' ? '--ignore-validation' : ''

  const command = `${process.env.ODE_RENDERER_CMD} ${ignoreValidation} ${fontsOption} ${octopusPath} ${renderPath}`

  try {
    execSync(command, {
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

export async function renderOctopus(id: string, octopusPath: string): Promise<RenderResult> {
  const { time, result } = await benchmarkAsync(() => render(id, octopusPath))
  return { ...result, time }
}
