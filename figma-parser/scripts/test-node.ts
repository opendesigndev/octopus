import { createParser } from '../src/index-node'
import { Parser } from '../src/parser'

const parser = createParser({
  designId: '9lJg7hAgjsDgrpueS30dMg',
  token:
    'MzpjaGtwdDo4MzM3ODEzMTI4MTUyODc3NzA6Y2hlY2twb2ludHMvTnhKL1d3MC9QMEg0cWh1eWFzYmpFdk5QLzdKcjVjQngzek1MbzAyZXpEQ3luUjUuZmlnOjlsSmc3aEFnanNEZ3JwdWVTMzBkTWc6dmlldzoxNjU0Mzg0MTIyOjk3NTAyN2Q2YmQ5NTc3NGUzNDhmM2NmNzg4Y2I4MGU3ZDZmNGQ3MTI=', // '117960-0bf13919-ba73-427d-800a-07c02b5f71a3',
  ids: ['120:4'], // ['306:789'],
  host: 'api.figma.com',
  pixelsLimit: 1e7,
  framePreviews: true,
  previewsParallels: 3,
  // framePreviews: boolean
  tokenType: 'base64',
  // previewsParallels: number
  nodesParallels: 3,
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
  Parser.getLogger()?.info('ready:design', design.designId)
})
design.on('ready:frame-like', (frameLike) => {
  Parser.getLogger()?.info('ready:frame-like', {
    id: frameLike.node.document.id,
    name: frameLike.node.document.name,
  })
})
design.on('ready:fills', (fills) => {
  Parser.getLogger()?.info('ready:fills', fills)
})
design.on('ready:fill', (fill) => {
  Parser.getLogger()?.info('ready:fill', {
    ...fill,
    bufferLength: fill.buffer.byteLength,
  })
})
design.on('ready:rendition', (rendition) => {
  Parser.getLogger()?.info('ready:rendition', {
    ...rendition,
    bufferLength: rendition.buffer.byteLength,
  })
})
design.on('ready:preview', (preview) => {
  Parser.getLogger()?.info('ready:preview', preview)
})
