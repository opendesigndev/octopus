import os from 'os'
import path from 'path'

import chalk from 'chalk'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import { OctopusAIConverter } from '../../src/index.js'
import { AIFileReader } from '../../src/services/conversion/ai-file-reader/index.js'
import { LocalExporter } from '../../src/services/conversion/exporters/local-exporter.js'

dotenv.config()
;(async () => {
  const filePath = process.argv.slice(2)[0]

  if (!filePath) {
    console.log(`${chalk.red('could not find file path')}`)
    return
  }

  const reader = new AIFileReader({ path: filePath })

  const sourceDesign = await reader.sourceDesign

  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }

  const octopusAIConverter = new OctopusAIConverter({})
  const testDir = path.join(os.tmpdir(), LocalExporter.OCTOPUS_SUBFOLDER, uuidv4())
  const exporter = new LocalExporter({ path: testDir })
  await octopusAIConverter.convertDesign({ exporter, sourceDesign })
  await exporter.completed()
  console.info(`Output: file://${testDir}`)
  await reader.cleanup()
})()
