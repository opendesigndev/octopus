import os from 'os'
import path from 'path'

import { S3Plugin } from '@opendesign/figma-parser-s3-plugin'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import { LocalExporter, createConverter, SourceApiReader } from '../../release/index.js'

import type { IPathLocator } from '@opendesign/figma-parser-s3-plugin'

dotenv.config()

const converter = createConverter()

class PathLocator implements IPathLocator {
  _prefix: string
  constructor() {
    this._prefix = 'qweqwe'
  }
  async getCacheMap(): Promise<string> {
    return `${this._prefix}/cache-map.json`
  }
  // sources
  async getDesign(id: string): Promise<string> {
    return `${this._prefix}/design-${id}.json`
  }
  async getFrameLike(designId: string, id: string): Promise<string> {
    return `${this._prefix}/framelike-${designId}-${id}.json`
  }
  async getLibrary(id: string): Promise<string> {
    return `${this._prefix}/library-${id}.json`
  }
  async getPreview(designId: string, nodeId: string): Promise<string> {
    return `${this._prefix}/preview-${designId}-${nodeId}.json`
  }
  async getFill(designId: string, ref: string): Promise<string> {
    return `${this._prefix}/fill-${designId}-${ref}.json`
  }
}

async function convertDesign() {
  const testDir = path.join(os.tmpdir(), uuidv4())

  const cacherOptions = {
    verbose: true,
    pathLocator: new PathLocator(),
    parallels: { upload: 5, download: 5 },
    buckets: { upload: 'test-bucket', download: 'test-bucket' },
    // s3: new AWS.S3(/** */),
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const cacher = new S3Plugin(cacherOptions)

  const readerOptions = {
    designId: 'heBbyAD357sQuwuR8LZfcS',
    token: 'figd_***',
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
    cacher: cacher.cacher,
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const reader = new SourceApiReader(readerOptions)

  const exporter = new LocalExporter({ path: testDir })

  await converter.convertDesign({ designEmitter: reader.parse(), exporter, skipReturn: true })
  await exporter.completed()

  console.info()
  console.info(`Output: file://${testDir}`)
}

convertDesign()
