import path from 'path'

import chalk from 'chalk'
import dotenv from 'dotenv'
import kebabCase from 'lodash/kebabCase'

import { OctopusPSDConverter, SourceFileReader, TempExporter } from '../src'
import { displayPerf } from '../src/utils/console'
import { getPkgLocation } from './utils/pkg-location'
import { renderOctopus } from './utils/render'
import { timestamp } from './utils/timestamp'

type ConvertAllOptions = {
  shouldRender?: boolean
  location: string
}

type ConvertedArtboard = {
  id: string
  name: string
  time: number
  error: Error | null
  octopusPath: string
  sourcePath: string
}

dotenv.config()

export async function convertDesign({
  location,
  shouldRender = process.env.CONVERT_RENDER === 'true',
}: ConvertAllOptions): Promise<void> {
  const outputDir = path.join(await getPkgLocation(), 'workdir')
  const designId = `${timestamp()}-${kebabCase(path.basename(location, '.psd'))}`
  const exporter = new TempExporter({ tempDir: outputDir, id: designId })

  exporter.on('octopus:artboard', async (artboard: ConvertedArtboard) => {
    const status = artboard.error ? '❌' : '✅'
    const render = shouldRender && !artboard.error ? await renderOctopus(artboard.id, artboard.octopusPath) : null
    const renderPath =
      render === null
        ? '<none>'
        : render.error
        ? chalk.red(render.error.message)
        : `file://${render.value} ${displayPerf(render.time)}`

    console.log(`\n${chalk.yellow('Artboard')} ${location} ${status}`)
    console.log(`  ${chalk.cyan(`Octopus:`)} file://${artboard.octopusPath} ${displayPerf(artboard.time)}`)
    console.log(`  ${chalk.cyan(`Render:`)} ${renderPath}`)
  })

  exporter.on('octopus:manifest', (manifest: string) => {
    console.log(`  ${chalk.cyan(`Manifest:`)} file://${manifest}\n\n`)
  })

  const reader = new SourceFileReader({ path: location, designId })
  const sourceDesign = await reader.sourceDesign
  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }
  const converter = new OctopusPSDConverter({ sourceDesign })
  converter.convertDesign({ exporter })
  await exporter.completed()
}

const location = process.argv[2]
convertDesign({ location })
