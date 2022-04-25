import path from 'path'

import chalk from 'chalk'
import dotenv from 'dotenv'

import { OctopusXDConverter, TempExporter, XDFileReader } from '../src'
import { getPkgLocation } from './utils/pkg-location'
import { renderOctopus } from './utils/render'

type ConvertAllOptions = {
  render?: boolean
  filename: string
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

dotenv.config()

export async function convertAll(options: ConvertAllOptions): Promise<void> {
  const exporter = new TempExporter({ tempDir: options.outputDir })
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
    ${chalk.cyan('Error:')} ${artboard.error ? chalk.red(artboard.error) : '<none>'}
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

  const reader = new XDFileReader({ path: options.filename, storeAssetsOnFs: true })
  const sourceDesign = await reader.sourceDesign
  const converter = new OctopusXDConverter({ sourceDesign })
  converter.convertDesign({ exporter })
  await exporter.completed()
  await reader.cleanup()
}

async function convert() {
  const filenames = process.argv.slice(2)

  for (const filename of filenames) {
    await convertAll({
      filename,
      render: process.env.CONVERT_RENDER === 'true',
      outputDir: path.join(await getPkgLocation(), 'workdir'),
    })
  }
}

convert()
