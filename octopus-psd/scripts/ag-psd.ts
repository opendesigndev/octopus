import * as fs from 'fs'
import 'ag-psd/initialize-canvas' // only needed for reading image data and thumbnails
import { readPsd } from 'ag-psd'

const [location] = process.argv.slice(2)
const buffer = fs.readFileSync(location)

// read only document structure
const psd1 = readPsd(buffer, {
  skipLayerImageData: true,
  skipCompositeImageData: true,
  skipThumbnail: true,
  skipLinkedFilesData: true,
  useImageData: true,
  logMissingFeatures: true,
  logDevFeatures: true,
})
console.log(psd1)
console.log(psd1.children)

// read document structure and image data
// const psd2 = readPsd(buffer)
// console.log(psd2)
// console.log(psd2.children)

// by defaults `canvas` field type is HTMLCanvasElement, so it needs to be cast to `any`
// or node-canvas `Canvas` type, in order to call `toBuffer` method
// fs.writeFileSync('layer-1.png', (psd2.children?[0].canvas as any).toBuffer())
