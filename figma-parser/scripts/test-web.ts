import { createParser } from '../src/index-web.js'

const parser = createParser({
  designId: '9lJg7hAgjsDgrpueS30dMg', // 'kBEFObmdY1v5G5Qr3go5Uh', // ,
  // https://app.avcd.cz/figma-import?filename=ololo&desktop=false&filekey=9lJg7hAgjsDgrpueS30dMg&ids=1:2&token=
  token: '117960-0bf13919-ba73-427d-800a-07c02b5f71a3',
  ids: [], // ['306:789'],
  host: 'api.figma.com',
  pixelsLimit: 1e7,
  framePreviews: true,
  previewsParallels: 3,
  // framePreviews: boolean
  tokenType: 'personal',
  // previewsParallels: number
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
design.on('ready:artboard', (frameLike) => {
  console.log('ready:artboard', frameLike)
})
design.on('ready:component', (frameLike) => {
  console.log('ready:component', frameLike)
})
design.on('ready:library', (frameLike) => {
  console.log('ready:library', frameLike)
})
design.on('ready:fill', (fill) => {
  console.log('ready:fill', fill)
})
design.on('ready:rendition', (rendition) => {
  console.log('ready:rendition', rendition)
})
design.on('ready:preview', (preview) => {
  console.log('ready:preview', preview)
})

// window.addEventListener('DOMContentLoaded', () => {
//   document.body.innerHTML =
//     '<img src="https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/924b7efd-93bb-44cd-a8c1-d8c5619c1296">'
// })
