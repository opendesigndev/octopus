import path from 'path'

import { displayPerf } from '@avocode/octopus-common/dist/utils/console'
import chalk from 'chalk'
import dotenv from 'dotenv'
import kebabCase from 'lodash/kebabCase'

import { OctopusPSDConverter, SourceFileReader, DebugExporter } from '../src'
import { getPkgLocation } from './utils/pkg-location'
import { renderOctopus } from './utils/render'
import { timestamp } from './utils/timestamp'

type ConvertAllOptions = {
  shouldRender?: boolean
  location: string
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
  location,
  shouldRender = process.env.CONVERT_RENDER === 'true',
}: ConvertAllOptions): Promise<void> {
  const outputDir = path.join(await getPkgLocation(), 'workdir')
  const designId = `${timestamp()}-${kebabCase(path.basename(location, '.psd'))}`
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

    console.log(`\n${chalk.yellow('Component')} ${location} ${status}`)
    console.log(`  ${chalk.cyan(`Octopus:`)} file://${component.octopusPath} ${displayPerf(component.time)}`)
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

  converter.convertDesign({ exporter, sourceDesign })
  await exporter.completed()
}

const location = process.argv[2]
convertDesign({ location })
