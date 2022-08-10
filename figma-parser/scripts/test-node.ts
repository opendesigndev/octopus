import { createParser } from '../src/index-node.js'

const parser = createParser({
  designId: '9lJg7hAgjsDgrpueS30dMg', // 'kBEFObmdY1v5G5Qr3go5Uh', // ,
  token: '117960-0bf13919-ba73-427d-800a-07c02b5f71a3',
  ids: [], // ['306:789'],
  host: 'api.figma.com',
  pixelsLimit: 1e7,
  framePreviews: true,
  previewsParallels: 3,
  tokenType: 'personal',
  nodesParallels: 30,
  s3Parallels: 30,
  verbose: true,
  figmaIdsFetchUsedComponents: true,
  renderImagerefs: false,
  shouldObtainLibraries: true,
  shouldObtainStyles: true,
  parallelRequests: 10,
})

const design = parser.parse()

design.on('ready:design', (design) => {
  console.log('ready:design', design)
})
design.on('ready:frame-like', (frameLike) => {
  console.log('ready:frame-like', {
    designId: frameLike.designId,
    nodeId: frameLike.nodeId,
  })
})
