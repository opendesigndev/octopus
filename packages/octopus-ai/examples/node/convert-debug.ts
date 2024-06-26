import path from 'path'

import { displayPerf } from '@opendesign/octopus-common/dist/utils/console.js'
import chalk from 'chalk'
import dotenv from 'dotenv'

import { renderOctopus } from './utils/render-octopus.js'
import { timestamp } from './utils/timestamp.js'
import { createConverter, TempExporter, AIFileReader } from '../../src/index-node.js'

dotenv.config()

type ConvertAllOptions = {
  render?: boolean
  filePath: string
  outputDir: string
}

export async function convertAll({ render, filePath, outputDir }: ConvertAllOptions): Promise<void> {
  const designId = `${timestamp()}-${path.basename(filePath, '.ai')}`
  const exporter = new TempExporter({ tempDir: outputDir, id: designId })

  exporter.on('octopus:manifest', (manifest) => {
    console.log(`${chalk.yellow('octopus-manifest: ')}
    file://${manifest}`)
  })

  exporter.on('source:resources', ({ metadata, images, additionalTextData }) => {
    console.log(`${chalk.yellow('metadata: ')}
    file://${metadata}`)

    console.log(`${chalk.yellow('images: ')}
    file://${images}`)

    if (additionalTextData) {
      console.log(`${chalk.yellow('additionalTextData: ')}
      file://${additionalTextData}`)
    }
  })

  exporter.on('octopus:artboard', async ({ id, name, time, error, octopusPath, sourcePath }) => {
    if (error) {
      console.log(`${chalk.red('Error converting artboard')}`)
      console.table({ id, name, time })
      console.error(error)
      return
    }

    const renderResult = render && !error ? await renderOctopus(id, octopusPath) : null

    console.log(`${chalk.cyan('Render: ')}
    ${
      renderResult === null
        ? '<none>'
        : renderResult.error
        ? chalk.red(renderResult.error.message)
        : `file://${renderResult.value} ${displayPerf(renderResult?.time)}`
    }`)

    console.log(chalk.green('converted Artboard:'))
    console.table({ id, name, time })
    console.log(`${chalk.yellow('sourcePath: ')}
    file://${sourcePath}`)

    console.log(`${chalk.yellow('octopusPath: ')}
    file://${octopusPath}`)
  })

  const reader = new AIFileReader({ path: filePath })

  const sourceDesign = await reader.getSourceDesign()

  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }

  const octopusAIConverter = createConverter()
  await octopusAIConverter.convertDesign({ exporter, sourceDesign })
  await exporter.completed()
  await reader.cleanup()
}

async function convert() {
  const filePath = process.argv.slice(2)[0]
  await convertAll({
    filePath,
    render: process.env.SHOULD_RENDER === 'true',
    outputDir: new URL(`../../${process.env.OUTPUT_DIR ?? 'workdir'}`, import.meta.url).pathname,
  })
}

convert()
