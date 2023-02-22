import os from 'os'
import path from 'path'

import { v4 as uuidv4 } from 'uuid'

import { createConverter } from '../../src/index-node.js'
import { LocalExporter, PSDFileReaderNode } from '../../src/octopus-psd-converter.js'

async function convert() {
  const [filePath] = process.argv.slice(2)
  const testDir = path.join(os.tmpdir(), uuidv4())

  const reader = await PSDFileReaderNode.withRenderer({ path: filePath })

  const sourceDesign = await reader.getSourceDesign()
  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }
  const exporter = new LocalExporter({ path: testDir })
  const converter = createConverter()

  await converter.convertDesign({ exporter, sourceDesign })
  await exporter.completed()

  console.info()
  console.info(`Input: ${filePath}`)
  console.info(`Output: ${testDir}`)
}

convert()
