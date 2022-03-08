import { convertDesign } from './utils/convert-design'

const [filename] = process.argv.slice(2)

convertDesign(filename)
