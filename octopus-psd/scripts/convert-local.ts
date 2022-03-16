import os from 'os'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { OctopusPSDConverter, LocalExporter } from '../src'

async function convert() {
  const [filePath] = process.argv.slice(2)
  const testDir = path.join(os.tmpdir(), uuidv4())
  const converter = await OctopusPSDConverter.fromFile({ filePath })
  if (converter === null) {
    console.error('OctopusPSDConverter Failed')
    return
  }

  // const sourceDesign = converter.sourceDesign.values
  // console.info('sourceDesign', sourceDesign)

  const exporter = new LocalExporter({ path: testDir })
  await converter.convertDesign({ exporter })
  await exporter.completed()
  console.log(`Input: ${filePath}`)
  console.log(`Output: ${testDir}`)
}

convert()
