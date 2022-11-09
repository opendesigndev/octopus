import { createParser } from '../src/index-node'

const parser = createParser({
  designId: 'seOu5Dewcc8tbHIxgWBHR9', // 'kBEFObmdY1v5G5Qr3go5Uh', // ,
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

;(async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // console.log('odsss', require('util').inspect(await design.getFrameLikeIds(), { depth: null }))
})()

design.on('ready:design', (design) => {
  console.log('ready:design', design)
})
design.on('ready:library', (frameLike) => {
  console.log('ready:library', frameLike)
})
