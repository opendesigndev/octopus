import chalk from 'chalk'
import dotenv from 'dotenv'

import { LocalExporter, OctopusAIConverter } from '../src'

dotenv.config()
;(async () => {
  const filePath = process.argv.slice(2)[0]

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
