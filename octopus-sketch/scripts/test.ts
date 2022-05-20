import { SketchFileReader } from '../src/services/reader/sketch-file-reader'

const [filename] = process.argv.slice(2)

new SketchFileReader({
  path: filename,
})
