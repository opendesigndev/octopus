import os from 'os'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { OctopusXDConverter, LocalExporter } from '../src'

async function convert() {
  const [filename] = process.argv.slice(2)
  const testDir = path.join(os.tmpdir(), uuidv4())
  const converter = await OctopusXDConverter.fromFile({ filename })
  const exporter = new LocalExporter({ path: testDir })
  await converter.convertDesign({ exporter })
  await exporter.completed()
  console.log(`Input: ${filename}`)
  console.log(`Output: ${testDir}`)
}

convert()
