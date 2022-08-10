import path from 'path'

import { displayPerf } from '@avocode/octopus-common/dist/utils/console'
import chalk from 'chalk'
import dotenv from 'dotenv'

import { OctopusFigConverter, SourceApiReader, DebugExporter } from '../src/index.js'
import { getPkgLocation } from './utils/pkg-location.js'
import { renderOctopus } from './utils/render.js'

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
  const exporter = new DebugExporter({ tempDir: outputDir, designId })

  // exporter.on('source:design', (sourcePath: string) => console.info(`${chalk.yellow('Source: ')} file://${sourcePath}`))
  // exporter.on('source:image', (imagePath: string) => console.info(`${chalk.yellow(`Image:`)} file://${imagePath}`))
  // exporter.on('source:preview', (imagePath: string) => console.info(`${chalk.yellow(`Preview:`)} file://${imagePath}`))

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
  const converter = new OctopusFigConverter({ design: reader.design })
  await converter.convertDesign({ exporter, skipReturn: true })
  await exporter.completed()
}

const designId = process.argv[2]
convertDesign({ designId })
