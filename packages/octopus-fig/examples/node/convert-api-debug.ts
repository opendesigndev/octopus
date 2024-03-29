import { displayPerf } from '@opendesign/octopus-common/dist/utils/console.js'
import chalk from 'chalk'
import dotenv from 'dotenv'

import { renderOctopus } from './utils/render.js'
import { createConverter, DebugExporter, SourceApiReader } from '../../src/index-node.js'

type ConvertDesignOptions = {
  designId: string
  shouldRender?: boolean
}

type ConvertedDocumentResult = {
  id: string
  time: number
  error: Error | null
  octopusPath: string
  dependencies?: {
    images: Promise<string>[]
  }
}

dotenv.config()

const converter = createConverter()

export async function convertDesign({
  designId,
  shouldRender = process.env.SHOULD_RENDER === 'true',
}: ConvertDesignOptions): Promise<void> {
  const outputDir = new URL('../../workdir', import.meta.url).pathname
  const exporter = new DebugExporter({ tempDir: outputDir, designId })

  // exporter.on('source:design', (sourcePath: string) => console.info(`${chalk.yellow('Source: ')} file://${sourcePath}`))
  // exporter.on('source:image', (imagePath: string) => console.info(`${chalk.yellow(`Image:`)} file://${imagePath}`))
  // exporter.on('source:preview', (imagePath: string) => console.info(`${chalk.yellow(`Preview:`)} file://${imagePath}`))

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

    console.info(`\n${chalk.yellow(role)} ${result.id} ${status}`)
    console.info(`  ${chalk.cyan(`Octopus:`)} file://${result.octopusPath} ${displayPerf(result.time)}`)
    console.info(`  ${chalk.cyan(`Render:`)} ${renderPath}`)
  })

  exporter.on('octopus:manifest', (manifestPath: string) => {
    console.info(`\n${chalk.yellow(`Manifest:`)} file://${manifestPath}\n\n`)
  })

  const readerOptions = {
    designId,
    token: process.env.API_TOKEN as string,
    ids: [],
    host: 'api.figma.com',
    pixelsLimit: 1e7,
    framePreviews: true,
    previewsParallels: 3,
    tokenType: 'personal',
    nodesParallels: 10,
    s3Parallels: 10,
    verbose: true,
    figmaIdsFetchUsedComponents: true,
    renderImagerefs: false,
    shouldObtainLibraries: true,
    shouldObtainStyles: true,
    parallelRequests: 5,
  }

  const reader = new SourceApiReader(readerOptions)
  await converter.convertDesign({ designEmitter: reader.parse(), exporter, skipReturn: true })
  await exporter.completed()
}

export async function convertDesigns(designIds: string[], shouldRender?: boolean) {
  for (const designId of designIds) {
    await convertDesign({ designId, shouldRender })
  }
}

const designIds = process.argv.slice(2)
convertDesigns(designIds)
