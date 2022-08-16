import chalk from 'chalk'
import dotenv from 'dotenv'

import { LocalExporter, OctopusAIConverter } from '../src'
import { getFileLocation } from './utils/get-file-location'

dotenv.config()
;(async () => {
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

  const exporter = new LocalExporter({ path: tempDir })
  await converter.convertDesign({ exporter })
})()
