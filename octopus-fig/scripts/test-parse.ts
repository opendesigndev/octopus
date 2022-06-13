import { createParser } from '@avocode/figma-parser/lib/src/index-node'

const parser = createParser({
  designId: 'KdkxHbiG8OgfBlV8Gm6cKu', // 'kBEFObmdY1v5G5Qr3go5Uh', // ,
  token: '376694-3ac3693b-cd97-4cd3-97b1-dc54aea109bf',
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

design.on('ready:design', (design: any) => {
  console.info()
  console.info('ready:design')
  console.info(JSON.stringify(design))
  console.info()
})

design.on('ready:artboard', (artboard: any) => {
  console.info()
  console.info('ready:artboard')
  console.info(JSON.stringify(artboard))
  console.info()
})
