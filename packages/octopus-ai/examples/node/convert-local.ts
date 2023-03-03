import os from 'os'
import path from 'path'

import chalk from 'chalk'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import { createConverter } from '../../src/index-node.js'
import { LocalExporter } from '../../src/services/conversion/exporters/local-exporter.js'
import { AIFileReaderNode } from '../../src/services/readers/ai-file-reader-node.js'

dotenv.config()
;(async () => {
  const filePath = process.argv.slice(2)[0]

  if (!filePath) {
    console.log(`${chalk.red('could not find file path')}`)
    return
  }

  const reader = new AIFileReaderNode({ path: filePath })

  const sourceDesign = await reader.getSourceDesign()

  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }

  const octopusAIConverter = createConverter()
  const testDir = path.join(os.tmpdir(), LocalExporter.OCTOPUS_SUBFOLDER, uuidv4())
  const exporter = new LocalExporter({ path: testDir })
  await octopusAIConverter.convertDesign({ exporter, sourceDesign })
  await exporter.completed()
  console.info(`Output: file://${testDir}`)
  await reader.cleanup()
})()
