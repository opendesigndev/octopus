import path from 'path'

import chalk from 'chalk'
import dotenv from 'dotenv'

import { OctopusFigConverter, SourceApiReader, TempExporter } from '../src'
import { displayPerf } from '../src/utils/console'
import { getPkgLocation } from './utils/pkg-location'
import { renderOctopus } from './utils/render'

type ConvertAllOptions = {
  shouldRender?: boolean
  designId: string
}

type ConvertedArtboard = {
  id: string
  time: number
  error: Error | null
  octopusPath: string
}

dotenv.config()

export async function convertDesign({
  designId,
  shouldRender = process.env.CONVERT_RENDER === 'true',
}: ConvertAllOptions): Promise<void> {
  const outputDir = path.join(await getPkgLocation(), 'workdir')
  const exporter = new TempExporter({ tempDir: outputDir, designId })

  exporter.on('source:design', (sourcePath: string) => {
    console.info(`\n${chalk.yellow('Source: ')} file://${sourcePath}`)
  })

  exporter.on('octopus:artboard', async (artboard: ConvertedArtboard) => {
    const status = artboard.error ? `❌ ${artboard.error}` : '✅'
    const render = shouldRender && !artboard.error ? await renderOctopus(artboard.id, artboard.octopusPath) : null
    const renderPath =
      render === null
        ? '<none>'
        : render.error
        ? chalk.red(render.error.message)
        : `file://${render.value} ${displayPerf(render.time)}`

    console.info(`\n${chalk.yellow('Artboard')} ${artboard.id} ${status}`)
    console.info(`  ${chalk.cyan(`Octopus:`)} file://${artboard.octopusPath} ${displayPerf(artboard.time)}`)
    console.info(`  ${chalk.cyan(`Render:`)} ${renderPath}`)
  })

  exporter.on('octopus:manifest', (manifestPath: string) => {
    console.info(`\n${chalk.yellow(`Manifest:`)} file://${manifestPath}\n\n`)
  })

  const reader = new SourceApiReader({ designId })
  const designPromise = reader.designPromise()
  const converter = new OctopusFigConverter({ designPromise })
  converter.convertDesign({ exporter })
  await exporter.completed()
}

const designId = process.argv[2]
convertDesign({ designId })
