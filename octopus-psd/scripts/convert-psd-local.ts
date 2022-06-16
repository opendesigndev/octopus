import os from 'os'
import path from 'path'

import { v4 as uuidv4 } from 'uuid'

import { LocalExporter, OctopusPSDConverter, PSDFileReader } from '../src'

async function convert() {
  const [filePath] = process.argv.slice(2)
  const testDir = path.join(os.tmpdir(), uuidv4())

  const reader = new PSDFileReader({ path: filePath })
  const sourceDesign = await reader.sourceDesign
  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }
  const converter = new OctopusPSDConverter({ sourceDesign })
  const exporter = new LocalExporter({ path: testDir })
  await converter.convertDesign({ exporter })
  await exporter.completed()

  console.info()
  console.info(`Input: ${filePath}`)
  console.info(`Output: ${testDir}`)

  await reader.cleanup()
}

convert()
