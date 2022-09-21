import fsp from 'fs/promises'

import dotenv from 'dotenv'

import { SourceApiReader } from '../../src/services/readers/source-api-reader'

import type { Design } from '@avocode/figma-parser/lib/src/index-node'

dotenv.config()

export function timestamp(): string {
  return new Date().toISOString().slice(2, 19).replace(/[-:]/g, '').replace('T', '-')
}

export function getCommandLineArgs(): { selectedAsset: string | undefined } {
  return { selectedAsset: process.argv[2] }
}

export function lazyRead<T>(path: string) {
  let data: T
  return async () => {
    if (data === undefined) {
      data = JSON.parse(await fsp.readFile(path, 'utf-8'))
    }
    return data
  }
}

export async function getSourceDesign(designId: string): Promise<Design> {
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
  return reader.parse()
}
