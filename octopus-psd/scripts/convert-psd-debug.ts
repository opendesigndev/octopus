import path from 'path'

import { displayPerf } from '@avocode/octopus-common/dist/utils/console'
import chalk from 'chalk'
import dotenv from 'dotenv'
import kebabCase from 'lodash/kebabCase'

import { OctopusPSDConverter, PSDFileReader, DebugExporter } from '../src'
import { getFilesFromDir, isDirectory } from '../src/utils/files'
import { getPkgLocation } from './utils/pkg-location'
import { renderOctopus } from './utils/render'
import { timestamp } from './utils/timestamp'

type ConvertAllOptions = {
  shouldRender?: boolean
  filePath: string
  outputDir: string
}

type ConvertedComponent = {
  id: string
  name: string
  time: number
  error: Error | null
  octopusPath: string
  sourcePath: string
}

dotenv.config()

const converter = new OctopusPSDConverter()

export async function convertDesign({
  outputDir,
  filePath,
  shouldRender = process.env.CONVERT_RENDER === 'true',
}: ConvertAllOptions): Promise<void> {
  const designId = `${timestamp()}-${kebabCase(path.basename(filePath, '.psd'))}`
  const exporter = new DebugExporter({ tempDir: outputDir, id: designId })

  exporter.on('octopus:component', async (component: ConvertedComponent) => {
    const status = component.error ? '❌' : '✅'
    const render = shouldRender && !component.error ? await renderOctopus(component.id, component.octopusPath) : null
    const renderPath =
      render === null
        ? '<none>'
        : render.error
        ? chalk.red(render.error.message)
        : `file://${render.value} ${displayPerf(render.time)}`

    console.log(`\n${chalk.yellow('Component')} ${filePath} ${status}`)
    console.log(`  ${chalk.cyan(`Source:`)} file://${component.sourcePath}`)
    console.log(`  ${chalk.cyan(`Octopus:`)} file://${component.octopusPath} ${displayPerf(component.time)}`)
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
  converter.convertDesign({ exporter, sourceDesign })
  await exporter.completed()
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

async function convert(locations: string[]) {
  for (const location of locations) {
    if (await isDirectory(location)) {
      await convertDir(location)
    } else {
      await convertDesign({
        filePath: location,
        outputDir: path.join(await getPkgLocation(), 'workdir'),
      })
    }
  }
}

const locations = process.argv.slice(2)
convert(locations)
