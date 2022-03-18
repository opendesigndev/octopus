import path from 'path'
import chalk from 'chalk'

import { getPkgLocation } from './utils/pkg-location'
import { OctopusPSDConverter, TempExporter } from '../src'
import { renderOctopus } from './utils/render'
import { timestamp } from './utils/timestamp'
import { getFilesFromDir, isDirectory } from '../src/utils/files'

type ConvertAllOptions = {
  shouldRender?: boolean
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

export async function convertDesign({
  outputDir,
  filePath,
  shouldRender = process.env.CONVERT_RENDER === 'true',
}: ConvertAllOptions): Promise<void> {
  const designId = `${timestamp()}-${path.basename(filePath, '.psd')}`
  const exporter = new TempExporter({ tempDir: outputDir, id: designId })

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

    const render = shouldRender && !artboard.error ? await renderOctopus(artboard.id, artboard.octopusPath) : null

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

  const converter = await OctopusPSDConverter.fromFile({ filePath, designId })
  if (converter === null) {
    console.error('Missing converter')
    return
  }

  await converter.convertDesign({ exporter })
}

async function convertDir(dirPath: string) {
  try {
    const files = (await getFilesFromDir(dirPath)) ?? []
    for (const file of files) {
      if (!/\.psd$/i.test(file.name)) continue
      await convertDesign({
        filePath: path.join(dirPath, file.name),
        outputDir: path.join(await getPkgLocation(), 'workdir'),
      })
    }
  } catch {
    console.info(`Reading directory '${dirPath}' was not successful`)
  }
}

async function convert(location: string) {
  if (await isDirectory(location)) {
    convertDir(location)
  } else {
    convertDesign({
      filePath: location,
      outputDir: path.join(await getPkgLocation(), 'workdir'),
    })
  }
}

const [location] = process.argv.slice(2)
convert(location)
