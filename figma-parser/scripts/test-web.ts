import { createParser } from '../src/index-web'

const parser = createParser({
  designId: '9lJg7hAgjsDgrpueS30dMg', // 'kBEFObmdY1v5G5Qr3go5Uh', // ,
  // https://app.avcd.cz/figma-import?filename=ololo&desktop=false&filekey=9lJg7hAgjsDgrpueS30dMg&ids=1:2&token=
  token:
    'MzpjaGtwdDo4MzM3ODEzMTI4MTUyODc3NzA6Y2hlY2twb2ludHMvRXY4L3kwbi9ERTdYSGdjZjZnZWFZdG1EL2VnQzBxZE5zbHhrOEU1dUtiVThsbmQuZmlnOjlsSmc3aEFnanNEZ3JwdWVTMzBkTWc6dmlldzoxNjU0NDU4NDMxOmEzNjUzNGM3NmJkZmRkYTczZDIwNzMzNTNjZTg5NmU4MzJjYTNhN2I=',
  ids: ['1:2'], // ['306:789'],
  host: 'api.figma.com',
  pixelsLimit: 1e7,
  framePreviews: true,
  previewsParallels: 3,
  // framePreviews: boolean
  tokenType: 'base64',
  // previewsParallels: number
  nodesParallels: 30,
  s3Parallels: 30,
  verbose: true,
  figmaIdsFetchUsedComponents: true,
  renderImagerefs: true,
  shouldObtainLibraries: true,
  shouldObtainStyles: true,
  parallelRequests: 10,
})

const design = parser.parse()

design.on('ready:design', (design) => {
  console.log('ready:design', design.designId)
})
design.on('ready:frame-like', (frameLike) => {
  console.log('ready:frame-like', {
    id: frameLike.node.document.id,
    name: frameLike.node.document.name,
  })
})
design.on('ready:fill', (fill) => {
  console.log('ready:fill', {
    ...fill,
    bufferLength: fill.buffer.byteLength,
  })
})
design.on('ready:rendition', (rendition) => {
  console.log('ready:rendition', {
    ...rendition,
    bufferLength: rendition.buffer.byteLength,
  })
})
design.on('ready:preview', (preview) => {
  console.log('ready:preview', preview)
})

// window.addEventListener('DOMContentLoaded', () => {
//   document.body.innerHTML =
//     '<img src="https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/924b7efd-93bb-44cd-a8c1-d8c5619c1296">'
// })
