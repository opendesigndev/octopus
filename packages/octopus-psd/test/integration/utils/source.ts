import dotenv from 'dotenv'

import { PSDFileReaderNode } from '../../../src/services/readers/psd-file-reader-node.js'

import type { SourceDesign } from '../../../src/entities/source/source-design.js'

dotenv.config()

export async function getSourceDesign(designPath: string): Promise<SourceDesign | null> {
  const fileReader = new PSDFileReaderNode({ path: designPath })
  const sourceDesign = await fileReader.getSourceDesign()

  return sourceDesign
}
