import path from 'path'

import { displayPerf } from '@avocode/octopus-common/dist/utils/console'
import chalk from 'chalk'
import dotenv from 'dotenv'

import { createConverter, DebugExporter, SourceApiReader } from '../src/index-node'
import { getPkgLocation } from './utils/pkg-location'
import { renderOctopus } from './utils/render'

type ConvertAllOptions = {
  shouldRender?: boolean
  designId: string
}

type ConvertedDocumentResult = {
  id: string
  time: number
  error: Error | null
  octopusPath: string
}

dotenv.config()

export async function convertDesign({
  designId,
  shouldRender = process.env.CONVERT_RENDER === 'true',
}: ConvertAllOptions): Promise<void> {
  const outputDir = path.join(await getPkgLocation(), 'workdir')
  const exporter = new DebugExporter({ tempDir: outputDir, designId })

  // exporter.on('source:design', (sourcePath: string) => console.info(`${chalk.yellow('Source: ')} file://${sourcePath}`))
  // exporter.on('source:image', (imagePath: string) => console.info(`${chalk.yellow(`Image:`)} file://${imagePath}`))
  // exporter.on('source:preview', (imagePath: string) => console.info(`${chalk.yellow(`Preview:`)} file://${imagePath}`))

  exporter.on('octopus:document', async (result: ConvertedDocumentResult, role: string) => {
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
  const converter = createConverter({ design: reader.parse() })
  await converter.convertDesign({ exporter, skipReturn: true })
  await exporter.completed()
}

const designId = process.argv[2]
convertDesign({ designId })
