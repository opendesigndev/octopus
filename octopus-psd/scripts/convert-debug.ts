import path from 'path'
import chalk from 'chalk'
import dotenv from 'dotenv'
import kebabCase from 'lodash/kebabCase'

import { getPkgLocation } from './utils/pkg-location'
import { OctopusPSDConverter, TempExporter, PSDFileReader } from '../src'
import { renderOctopus } from './utils/render'
import { timestamp } from './utils/timestamp'
import { getFilesFromDir, isDirectory } from '../src/utils/files'
import { displayPerf } from '../src/utils/console'

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

dotenv.config()

export async function convertDesign({
  outputDir,
  filePath,
  shouldRender = process.env.CONVERT_RENDER === 'true',
}: ConvertAllOptions): Promise<void> {
  const designId = `${timestamp()}-${kebabCase(path.basename(filePath, '.psd'))}`
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

    console.log(`\n${chalk.yellow('Artboard')} ${filePath} ${status}`)
    console.log(`  ${chalk.cyan(`Source:`)} file://${artboard.sourcePath}`)
    console.log(`  ${chalk.cyan(`Octopus:`)} file://${artboard.octopusPath} ${displayPerf(artboard.time)}`)
    console.log(`  ${chalk.cyan(`Render:`)} ${renderPath}`)
  })

  exporter.on('octopus:manifest', (manifest: string) => {
    console.log(`  ${chalk.cyan(`Manifest:`)} file://${manifest}\n\n`)
  })

  const reader = new PSDFileReader({ path: filePath, designId })
  const sourceDesign = await reader.sourceDesign
  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }
  const converter = new OctopusPSDConverter({ sourceDesign })
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
  } catch (err) {
    console.info(`Reading directory '${dirPath}' was not successful`, err)
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
