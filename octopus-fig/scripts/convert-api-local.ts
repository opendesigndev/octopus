import os from 'os'
import path from 'path'

import { v4 as uuidv4 } from 'uuid'

import { LocalExporter, createConverter, SourceApiReader } from '../src/index-node'

async function convertDesign(designId: string) {
  const testDir = path.join(os.tmpdir(), uuidv4())
  const exporter = new LocalExporter({ path: testDir })

  const readerOptions = {
    designId,
    token: process.env.API_TOKEN as string,
    ids: [],
    host: 'api.figma.com',
    pixelsLimit: 1e7,
    framePreviews: true,
    previewsParallels: 3,
    tokenType: 'personal',
    nodesParallels: 10,
    s3Parallels: 10,
    verbose: true,
    figmaIdsFetchUsedComponents: true,
    renderImagerefs: false,
    shouldObtainLibraries: true,
    shouldObtainStyles: true,
    parallelRequests: 5,
  }

  const reader = new SourceApiReader(readerOptions)
  const converter = createConverter()
  await converter.convertDesign({ design: reader.parse(), exporter, skipReturn: true })
  await exporter.completed()

  console.info()
  console.info(`Output: file://${testDir}`)
}

const designId = process.argv[2]
convertDesign(designId)
