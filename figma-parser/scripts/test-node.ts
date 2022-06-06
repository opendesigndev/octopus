import fs from 'fs/promises'
import path from 'path'

import { createParser } from '../src/index-node'
import { Parser } from '../src/parser'

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
const p = path.join(__dirname, '..', '..', 'sample')

design.on('ready:design', (design) => {
  Parser.getLogger()?.info('ready:design', design.designId)
  fs.writeFile(path.join(p, 'design.json'), JSON.stringify(design))
})
design.on('ready:frame-like', (frameLike) => {
  Parser.getLogger()?.info('ready:frame-like', {
    id: frameLike.node.document.id,
    name: frameLike.node.document.name,
  })
  fs.writeFile(path.join(p, `frame-${frameLike.node.document.id}.json`), JSON.stringify(frameLike.node))
})
design.on('ready:fill', (fill) => {
  Parser.getLogger()?.info('ready:fill', {
    ...fill,
    bufferLength: fill.buffer.byteLength,
  })
  fs.writeFile(path.join(p, `fill-${fill.ref}.png`), Buffer.from(fill.buffer))
})
design.on('ready:rendition', (rendition) => {
  Parser.getLogger()?.info('ready:rendition', {
    ...rendition,
    bufferLength: rendition.buffer.byteLength,
  })
  fs.writeFile(path.join(p, `rendition-${rendition.nodeId}.png`), Buffer.from(rendition.buffer))
})
design.on('ready:preview', (preview) => {
  Parser.getLogger()?.info('ready:preview', preview)
  fs.writeFile(path.join(p, `preview-${preview.nodeId}.png`), Buffer.from(preview.buffer))
})
design.on('ready:library', (library) => {
  Parser.getLogger()?.info('ready:library', {
    nodeId: library.nodeId,
    designId: library.designId,
  })
  fs.writeFile(path.join(p, `library-${library.designId}-${library.nodeId}.json`), JSON.stringify(library.component))
})
