// import type { ArrayBufferEntry } from '../../src/typings'
import { parsePsd } from './parsePsd'

export const createSourceTree = async (filename: string) => {
  console.info('XXX1 filename', filename)

  const fileContent = await parsePsd(filename)
  console.info('XXX2', fileContent)

  // const structure = {
  //   manifest: fileContent.find((entry) => MANIFEST.test(entry.path)) || null,
  //   resources: fileContent.find((entry) => RESOURCES.test(entry.path)) || null,
  //   interactions: fileContent.find((entry) => INTERACTIONS.test(entry.path)) || null,
  //   artboards: fileContent.filter((entry) => ARTBOARDS.test(entry.path)),
  // }

  // return structure
}
