import path from 'path'
import * as url from 'url'

import { displayPerf } from '@opendesign/octopus-common/dist/utils/console.js'
import { timestamp } from '@opendesign/octopus-common/dist/utils/timestamp.js'
import chalk from 'chalk'
import dotenv from 'dotenv'
import kebabCase from 'lodash/kebabCase.js'

import { OctopusPSDConverter, DebugExporter, PSDFileReader } from '../../src/index.js'
import { getFilesFromDir, isDirectory } from '../../src/utils/files.js'
import { renderOctopus } from './utils/render.js'

type ConvertAllOptions = {
  shouldRender?: boolean
  filePath: string
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
  filePath,
  shouldRender = process.env.SHOULD_RENDER === 'true',
}: ConvertAllOptions): Promise<void> {
  const designId = `${timestamp()}-${kebabCase(path.basename(filePath, '.psd'))}`
  const tempDir = path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../../../', 'workdir')
  const exporter = new DebugExporter({ tempDir, id: designId })

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
    console.log(`\n${chalk.yellow(`Manifest:`)} file://${manifest}\n\n`)
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
      await convertDesign({ filePath: path.join(dirPath, file.name) })
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
      await convertDesign({ filePath: location })
    }
  }
}

const locations = process.argv.slice(2)
convert(locations)
