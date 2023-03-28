import os from 'os'
import path from 'path'

import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import { createConverter, LocalExporter, SourceApiReader } from '../../release/index.js'

dotenv.config()

const converter = createConverter()

async function convertDesign(designId: string) {
  const testDir = path.join(os.tmpdir(), uuidv4())

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

  const exporter = new LocalExporter({ path: testDir })

  await converter.convertDesign({ designEmitter: reader.parse(), exporter, skipReturn: true })
  await exporter.completed()

  console.info()
  console.info(`Output: file://${testDir}`)
}

const designId = process.argv[2]
convertDesign(designId)
