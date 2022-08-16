import chalk from 'chalk'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import { TempExporter, OctopusAIConverter } from '../../src'
import { getFileLocation } from './get-file-location'

import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

dotenv.config()
export async function convertDebug(): Promise<Nullable<string>> {
  const id = uuidv4()
  const filePath = getFileLocation()

  if (!filePath) {
    console.log(`${chalk.red('could not find file path')}`)
    return
  }

  const converter = await OctopusAIConverter.fromPath({ filePath })
  const tempDir = process.env.OUTPUT_DIR

  if (!tempDir) {
    return null
  }

  const exporter = new TempExporter({ tempDir, id })
  exporter.on('octopus:manifest', (manifest) => {
    console.log(`${chalk.yellow('Octopus-manifest: ')}
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

  let octopusPathResult

  exporter.on('octopus:artboard', ({ id, name, time, error, octopusPath, sourcePath }) => {
    if (error) {
      console.log(`${chalk.red('Error converting artboard')}`)
      console.table({ id, name, time })
      console.error(error)
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
