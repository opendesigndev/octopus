import os from 'os'
import path from 'path'

import { v4 as uuidv4 } from 'uuid'

import { LocalExporter, OctopusFigConverter, SourceApiReader } from '../src'

async function convertDesign(designId: string) {
  const testDir = path.join(os.tmpdir(), uuidv4())
  const exporter = new LocalExporter({ path: testDir })

  const reader = new SourceApiReader({ designId })
  const designPromise = reader.designPromise()
  const converter = new OctopusFigConverter({ designPromise })
  converter.convertDesign({ exporter })
  await exporter.completed()

  console.info()
  console.info(`Output: file://${testDir}`)
}

const designId = process.argv[2]
convertDesign(designId)
