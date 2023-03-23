import fs from 'fs/promises'
import path from 'path'

import { displayPerf } from '@opendesign/octopus-common/dist/utils/console.js'
import { timestamp } from '@opendesign/octopus-common/dist/utils/timestamp.js'
import chalk from 'chalk'
import dotenv from 'dotenv'

import { renderOctopus } from './utils/render.js'
import { createConverter, TempExporter, XDFileReader } from '../../src/index-node.js'

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
  const designId = `${timestamp()}-${path.basename(options.filename, '.xd')}`
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
    ${chalk.cyan('Error:')} ${artboard.error ? chalk.red(artboard.error) : '<none>'}
    ${chalk.cyan(`Source:`)} file://${artboard.sourcePath}
    ${chalk.cyan(`Octopus:`)} file://${artboard.octopusPath}
    ${chalk.cyan(`Render:`)} ${
      render === null
        ? '<none>'
        : render.error
        ? chalk.red(render.error.message)
        : `file://${render.value} ${displayPerf(render?.time)}`
    }
    `)
  })
  exporter.on('octopus:manifest', (manifest: string) => {
    console.log(`${chalk.yellow('Octopus-manifest: ')}
    file://${manifest}`)
  })

  const file = await fs.readFile(options.filename)
  const reader = new XDFileReader({ file, storeAssetsOnFs: true })
  const sourceDesign = await reader.sourceDesign
  const converter = createConverter({ sourceDesign })
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
      outputDir: path.join(__dirname, '../../', 'workdir'),
    })
  }
}

convert()
