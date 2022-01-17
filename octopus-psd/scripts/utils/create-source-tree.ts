import { promises as fsp } from 'fs'
import { parsePsd } from '@avocode/psd-parser'
import { SourceArtboard } from '../../src/entities/source/source-artboard'
import { OctopusPSDConverter } from '../../src'

const defaultOptions = (directory: string) => ({
  outDir: `./workdir/${directory}`,
  imagesSubfolder: 'pictures',
  previewPath: `./workdir/${directory}/preview.png`,
  octopusFileName: 'octopus-v2.json',
})

export async function createSourceTree(
  octopusConverter: OctopusPSDConverter,
  filename: string,
  directory: string
): Promise<SourceArtboard> {
  await parsePsd(filename, defaultOptions(directory))
  const sourceFile = `./workdir/${directory}/source.json`
  const file = await fsp.readFile(sourceFile, { encoding: 'utf8' })
  const sourceTree = JSON.parse(file)
  return new SourceArtboard({ octopusConverter, rawValue: sourceTree })
}
