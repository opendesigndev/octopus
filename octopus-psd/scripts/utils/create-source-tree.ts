import { promises as fsp } from 'fs'
import { parsePsd } from '@avocode/psd-parser'
import { SourceArtboard } from '../../src/entities/source/source-artboard'
import type { OctopusPSDConverter } from '../../src'
import path from 'path'

const OUTPUT_DIR = 'workdir'
const IMAGES_DIR = 'pictures'
const RENDER_IMG = 'preview.png'
const SOURCE_FILE = 'source.json'

const parsePsdOptions = (designId: string) => ({
  outDir: path.join(OUTPUT_DIR, designId),
  imagesSubfolder: IMAGES_DIR,
  previewPath: path.join(OUTPUT_DIR, designId, RENDER_IMG),
  octopusFileName: 'octopus-v2.json', // TODO remove in the end when octopus2 is not needed
})

export async function createSourceTree(
  octopusConverter: OctopusPSDConverter,
  filename: string,
  designId: string
): Promise<SourceArtboard> {
  await parsePsd(filename, parsePsdOptions(designId))
  const sourcePath = path.join(OUTPUT_DIR, designId, SOURCE_FILE)
  const file = await fsp.readFile(sourcePath, { encoding: 'utf8' })
  const sourceTree = JSON.parse(file)
  return new SourceArtboard({ octopusConverter, rawValue: sourceTree }) // TODO https://gitlab.avcd.cz/opendesign/octopus-converters/-/merge_requests/3#note_276627
}
