import { parsePsd as parse } from '@avocode/psd-parser'

const defaultPath = './sample/file.psd'
const defaultOptions = {
  outDir: './workdir',
  imagesSubfolder: 'pictures',
  previewPath: './workdir/preview.png',
  octopusFileName: 'source.json',
}

const parsePsd = (psdPath = defaultPath, options = defaultOptions) =>
  parse(psdPath, options)
    .then(({ octopusVersion }) => console.info(`Successfully completed Octopus ${octopusVersion}`))
    .catch((error: Error) => console.error('Something went wrong', error))

export { parsePsd }
