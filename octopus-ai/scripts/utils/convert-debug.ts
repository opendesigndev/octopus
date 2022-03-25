import dotenv from 'dotenv'
import chalk from 'chalk'
import { v4 as uuidv4 } from 'uuid'

import { OctopusAIConverter, TempExporter } from '../../src'
import { readAdditionalTextData } from './read-additional-text-data'

import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

dotenv.config()
export async function convertDebug(): Promise<Nullable<string>> {
  const id = uuidv4()
  const sourceDir = process.env.SOURCE_DIR

  if (!sourceDir) {
    console.log(`${chalk.red('could not find source dir')}`)
    return
  }

  const additionalTextData = readAdditionalTextData()
  const converter = await OctopusAIConverter.fromDir({ dirPath: sourceDir, additionalTextData })
  const tempDir = process.env.OUTPUT_DIR

  if (!tempDir) {
    return null
  }

  const exporter = new TempExporter({ tempDir, id })

  exporter.on('octopus:manifest', (manifest) => {
    console.log(`${chalk.yellow('Octopus-manifest: ')}
    file://${manifest}`)
  })

  exporter.on('source:resources', ({ metadata, images, ocProperties }) => {
    console.log(`${chalk.yellow('metadata: ')}
    file://${metadata}`)

    console.log(`${chalk.yellow('images: ')}
    file://${images}`)

    console.log(`${chalk.yellow('ocProperties: ')}
    file://${ocProperties}`)
  })

  let octopusPathResult

  exporter.on('octopus:artboard', ({ id, name, time, error, octopusPath, sourcePath }) => {
    if (error) {
      console.log(`${chalk.red('Error converting artboard')}`)
      console.table({ id, name, time })
      return
    }

    octopusPathResult = octopusPath

    console.log(chalk.green('converted Artboard:'))
    console.table({ id, name, time })
    console.log(`${chalk.yellow('sourcePath: ')}
    file://${sourcePath}`)

    console.log(`${chalk.yellow('octopusPath: ')}
    file://${octopusPath}`)
  })

  await converter.convertDesign({ exporter })
  return octopusPathResult
}
