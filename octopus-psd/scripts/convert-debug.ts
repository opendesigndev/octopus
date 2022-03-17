import path from 'path'
import chalk from 'chalk'

import { getPkgLocation } from './utils/pkg-location'
import { OctopusPSDConverter, TempExporter } from '../src'
import { renderOctopus } from './utils/render'
import { timestamp } from './utils/timestamp'

type ConvertAllOptions = {
  render?: boolean
  filePath: string
  outputDir: string
}

type ConvertedArtboard = {
  id: string
  name: string
  time: number
  error: Error | null
  octopusPath: string
  sourcePath: string
}

type ConvertedResources = {
  manifest: string
  interactions: string
  resources: string
  images: string[]
}

export async function convertDesign(options: ConvertAllOptions): Promise<void> {
  const designId = `${timestamp()}-${path.basename(options.filePath, '.psd')}`
  const exporter = new TempExporter({ tempDir: options.outputDir, id: designId })

  exporter.on('source:resources', (exportedResources: ConvertedResources) => {
    const { manifest, interactions, resources, images } = exportedResources
    console.log(`${chalk.yellow('Manifest: ')}
    file://${manifest}`)
    console.log(`${chalk.yellow('Interactions: ')}
    file://${interactions}`)
    console.log(`${chalk.yellow('Resources: ')}
    file://${resources}`)
    console.log(`${chalk.yellow('Images: ')}
    ${images.map((image) => `    file://${image}`).join('\n')}`)
  })
  exporter.on('octopus:artboard', async (artboard: ConvertedArtboard) => {
    const status = artboard.error ? '❌' : '✅'
    const name = chalk.yellow(artboard.name)
    const time = Math.round(artboard.time)
    const id = chalk.grey(`(${artboard.id})`)

    const render = options.render && !artboard.error ? await renderOctopus(artboard.id, artboard.octopusPath) : null

    console.log(`${chalk.yellow('Artboard: ')}
    ${status} ${name} (${time}ms) ${id}
    ${chalk.cyan(`Source:`)} file://${artboard.sourcePath}
    ${chalk.cyan(`Octopus:`)} file://${artboard.octopusPath}
    ${chalk.cyan(`Render:`)} ${
      render === null ? '<none>' : render.error ? chalk.red(render.error.message) : `file://${render.value}`
    }
    `)
  })
  exporter.on('octopus:manifest', (manifest: string) => {
    console.log(`${chalk.yellow('Octopus-manifest: ')}
    file://${manifest}`)
  })

  const converter = await OctopusPSDConverter.fromFile({ filePath: options.filePath, designId })
  if (converter === null) {
    console.error('Missing converter')
    return
  }

  await converter.convertDesign({ exporter })
}

async function convert() {
  const [filePath] = process.argv.slice(2)

  await convertDesign({
    filePath,
    render: Boolean(Number(process.env.CONVERT_RENDER)),
    outputDir: path.join(await getPkgLocation(), 'workdir'),
  })
}

convert()
