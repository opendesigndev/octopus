import { unzipArray } from './unzip'
import { ARTBOARDS, RESOURCES, INTERACTIONS, MANIFEST, IMAGES, PASTEBOARD } from './resources-patterns'

import type { UnzipFileInfo } from 'fflate'
import type { ArrayBuffersSourceTree } from '../../src/typings'

export default async function createSourceTree(filename: string): Promise<ArrayBuffersSourceTree> {
  const targetEntries = [ARTBOARDS, RESOURCES, INTERACTIONS, MANIFEST, IMAGES, PASTEBOARD]
  const filter = (file: UnzipFileInfo) => {
    return targetEntries.some((regex) => {
      return regex.test(file.name)
    })
  }
  const fileContent = await unzipArray({ filename, filter })
  const structure = {
    manifest: fileContent.find((entry) => MANIFEST.test(entry.path)) || null,
    resources: fileContent.find((entry) => RESOURCES.test(entry.path)) || null,
    interactions: fileContent.find((entry) => INTERACTIONS.test(entry.path)) || null,
    images: fileContent.filter((entry) => IMAGES.test(entry.path)),
    artboards: fileContent.filter((entry) => {
      return ARTBOARDS.test(entry.path) || PASTEBOARD.test(entry.path)
    }),
  }

  return structure
}
