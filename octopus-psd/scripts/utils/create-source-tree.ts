import { promises as fsp } from 'fs'
import { parsePsd } from '@avocode/psd-parser'
import { SourceArtboard } from '../../src/entities/source-artboard'

const defaultOptions = {
  outDir: './workdir',
  imagesSubfolder: 'pictures',
  previewPath: './workdir/preview.png',
  octopusFileName: 'octopus-v2.json',
}

export const createSourceTree = async (filename: string): Promise<SourceArtboard> => {
  await parsePsd(filename, defaultOptions)
  const sourceFile = './workdir/source.json'
  const file = await fsp.readFile(sourceFile, { encoding: 'utf8' })
  const sourceTree = JSON.parse(file)
  return sourceTree as SourceArtboard
}
