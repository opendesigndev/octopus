import { createParser } from '@avocode/figma-parser'

import { ENV } from '../src/services/general/environment.js'

const DEFAULT_ID = 'nFrTs6F4OjiSPMsAAAp16a'

const log = (name: string) => (design: unknown) => {
  console.info()
  console.info(`ready:${name}`)
  console.info(JSON.stringify(design))
  console.info()
}

const parse = async (designId = DEFAULT_ID) => {
  const token = ENV.API_TOKEN
  if (!token) return

  const parser = createParser({
    designId,
    token,
    ids: [],
    host: 'api.figma.com',
    pixelsLimit: 1e7,
    framePreviews: true,
    previewsParallels: 3,
    tokenType: 'personal',
    nodesParallels: 10,
    s3Parallels: 10,
    verbose: true,
    figmaIdsFetchUsedComponents: true,
    renderImagerefs: false,
    shouldObtainLibraries: true,
    shouldObtainStyles: true,
    parallelRequests: 5,
  })

  const design = parser.parse()

  design.on('ready:design', log('design'))
  design.on('ready:artboard', log('artboard'))
  design.on('ready:component', log('component'))
  design.on('ready:library', log('library'))
  design.on('ready:fill', log('fill'))
  design.on('ready:preview', log('preview'))
  design.on('ready:rendition', log('rendition'))
  design.on('ready:style', log('style'))
}

const designId = process.argv[2]
parse(designId)
