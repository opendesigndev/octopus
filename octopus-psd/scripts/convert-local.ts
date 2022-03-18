import os from 'os'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { OctopusPSDConverter, LocalExporter } from '../src'
import { PSDFileReader } from '../src/services/readers/psd-file-reader'

async function convert() {
  const [filePath] = process.argv.slice(2)
  const testDir = path.join(os.tmpdir(), uuidv4())

  const designId = uuidv4()
  const reader = new PSDFileReader({ path: filePath, designId })
  const sourceDesign = await reader.sourceDesign
  if (sourceDesign === null) {
    console.error('Creating SourceDesign Failed')
    return
  }
  const converter = new OctopusPSDConverter({ sourceDesign })
  if (converter === null) {
    console.error('OctopusPSDConverter Failed')
    return
  }

  const exporter = new LocalExporter({ path: testDir })
  await converter.convertDesign({ exporter })
  await exporter.completed()

  console.log(`Input: ${filePath}`)
  console.log(`Output: ${testDir}`)

  await reader.cleanup()
}

convert()
