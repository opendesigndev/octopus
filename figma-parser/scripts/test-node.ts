import { createParser } from '../src/index-node'

const parser = createParser({
  designId: 'a',
  host: 'a',
  token: 'a',
  ids: ['a', 'b'],
  pixelsLimit: 1,
  framePreviews: true,
  tokenType: 'a',
  previewsParallels: 1,
  nodesParallels: 1,
  s3Parallels: 1,
  verbose: true,
  figmaIdsFetchUsedComponents: true,
  renderImagerefs: true,
  shouldObtainLibraries: true,
  shouldObtainStyles: true,
  parallelRequests: 1,
})

;(async () => {
  console.log(await parser.test())
})()
