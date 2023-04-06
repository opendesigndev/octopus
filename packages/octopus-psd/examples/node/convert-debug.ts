import path from 'path'

import { FeaturesTracker } from '@opendesign/octopus-common/dist/services/features-tracker.js'
import { displayPerf } from '@opendesign/octopus-common/dist/utils/console.js'
import { timestamp } from '@opendesign/octopus-common/dist/utils/timestamp.js'
import chalk from 'chalk'
import dotenv from 'dotenv'
import kebabCase from 'lodash/kebabCase.js'

import { renderOctopus } from './utils/render.js'
import { createConverter, DebugExporter, PSDFileReader } from '../../src/index-node.js'
import { getFilesFromDir, isDirectory } from '../../src/utils/files.js'

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

async function convertDesign({
  filePath,
  shouldRender = process.env.SHOULD_RENDER === 'true',
}: ConvertAllOptions): Promise<void> {
  const designId = `${timestamp()}-${kebabCase(path.basename(filePath, '.psd'))}`
  const tempDir = new URL('../../../workdir', import.meta.url).pathname
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

  exporter.on('octopus:statistics', (statistics) => {
    console.log(`\n${chalk.yellow(`Statistics:`)} file://${statistics}\n\n`)
  })

  const reader = await PSDFileReader.withRenderer({ path: filePath })

  const sourceDesign = await reader.getSourceDesign()
  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }
  const converter = createConverter()
  converter.convertDesign({ exporter, sourceDesign, trackingService: FeaturesTracker.withDefaultPathKeys() })
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

export async function convert(locations: string[]) {
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
