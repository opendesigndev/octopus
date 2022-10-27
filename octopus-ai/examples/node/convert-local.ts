import chalk from 'chalk'
import dotenv from 'dotenv'

import { OctopusAIConverter, AIFileReader, LocalExporter } from '../../src'

dotenv.config()
;(async () => {
  const filePath = process.argv.slice(2)[0]

  if (!filePath) {
    console.log(`${chalk.red('could not find file path')}`)
    return
  }

  const tempDir = process.env.OUTPUT_DIR ?? './workdir'

  const reader = new AIFileReader({ path: filePath })

  const sourceDesign = await reader.sourceDesign

  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }

  const octopusAIConverter = new OctopusAIConverter({})
  const exporter = new LocalExporter({ path: tempDir })
  await octopusAIConverter.convertDesign({ exporter, sourceDesign })
  await exporter.completed()
  await reader.cleanup()
})()
