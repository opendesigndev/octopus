import path from 'path'

import { displayPerf } from '@opendesign/octopus-common/dist/utils/console.js'
import chalk from 'chalk'
import dotenv from 'dotenv'
import kebabCase from 'lodash/kebabCase.js'

import { renderOctopus } from './utils/render.js'
import { createConverter, DebugExporter, SourcePluginReader } from '../../src/index-node.js'
import { getFilesFromDir, isDirectory, parseJsonFromFile } from '../../src/utils/files.js'

import type { PluginSource } from '../../src/typings/plugin-source.js'

type ConvertDesignOptions = {
  sourcePath: string
  shouldRender?: boolean
}

type ConvertedDocumentResult = {
  id: string
  time: number
  error: Error | null
  octopusPath: string
  dependencies: {
    images: Promise<string>[]
  }
}

dotenv.config()

const converter = createConverter()

export async function convertDesign({
  sourcePath,
  shouldRender = process.env.SHOULD_RENDER === 'true',
}: ConvertDesignOptions): Promise<void> {
  const pluginSource: PluginSource | null = await parseJsonFromFile(sourcePath)
  const context = pluginSource?.context
  const { id: documentId, name: documentName } = context?.document ?? {}
  if (!pluginSource || !documentId || !documentName) {
    console.error(`Design conversion failed`, { documentId, documentName, pluginSource, context })
    return
  }

  const designId = kebabCase(`${documentId}-${documentName}-${path.basename(sourcePath, '.json')}`)
  const outputDir = new URL('../../workdir', import.meta.url).pathname
  const exporter = new DebugExporter({ tempDir: outputDir, designId })

  console.info(`Converting design: ${designId}\n`)

  exporter.on('octopus:component', async (result: ConvertedDocumentResult, role: string) => {
    if (result.dependencies?.images) await Promise.all(result.dependencies.images)
    const status = result.error ? `❌ ${result.error}` : '✅'
    const render = shouldRender && !result.error ? await renderOctopus(result.id, result.octopusPath) : null
    const renderPath =
      render === null
        ? '<none>'
        : render.error
        ? chalk.red(render.error.message)
        : `file://${render.value} ${displayPerf(render.time)}`

    console.info(`${chalk.yellow(role)} ${result.id} ${status}`)
    console.info(`  ${chalk.cyan(`Octopus:`)} file://${result.octopusPath} ${displayPerf(result.time)}`)
    console.info(`  ${chalk.cyan(`Render:`)} ${renderPath}\n`)
  })

  exporter.on('octopus:manifest', (manifestPath: string) => {
    console.info(`${chalk.yellow(`Manifest:`)} file://${manifestPath}\n\n`)
  })

  const reader = new SourcePluginReader(pluginSource)
  await converter.convertDesign({ designEmitter: reader.parse(), exporter })
  await exporter.completed()
}

async function convertDir(dirPath: string) {
  try {
    const files = (await getFilesFromDir(dirPath)) ?? []
    for (const file of files) {
      if (!/\.json$/i.test(file.name)) continue
      await convertDesign({ sourcePath: path.join(dirPath, file.name) })
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
      await convertDesign({ sourcePath: location })
    }
  }
}

const locations = process.argv.slice(2)
convert(locations)
