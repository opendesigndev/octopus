import os from 'os'
import path from 'path'

import { v4 as uuidv4 } from 'uuid'

import { createConverter, LocalExporter, XDFileReader } from '../../src/index-node.js'

async function convert() {
  const [filename] = process.argv.slice(2)
  const testDir = path.join(os.tmpdir(), uuidv4())
  const reader = new XDFileReader({ path: filename, storeAssetsOnFs: true })
  const sourceDesign = await reader.getSourceDesign()
  const converter = createConverter({ sourceDesign })
  const exporter = new LocalExporter({ path: testDir })
  await converter.convertDesign({ exporter })
  await exporter.completed()
  await reader.cleanup()
  console.log(`Input: ${filename}`)
  console.log(`Output: ${testDir}`)
}

convert()
