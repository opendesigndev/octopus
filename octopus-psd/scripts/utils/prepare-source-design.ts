import { readFile, readdir, stat, access } from 'fs/promises'
import { parsePsd } from '@avocode/psd-parser'
import { SourceDesign, SourceImage } from '../../src/entities/source/source-design'
import type { OctopusPSDConverter } from '../../src'
import path from 'path'
import sizeOf from 'image-size'

const OUTPUT_DIR = 'workdir'
const IMAGES_DIR = 'pictures'
const RENDER_IMG = 'preview.png'
const SOURCE_FILE = 'source.json'
const PATTERNS_DIR = 'patterns'

function getParsePsdOptions(designId: string) {
  return {
    outDir: path.join(OUTPUT_DIR, designId),
    imagesSubfolder: IMAGES_DIR,
    previewPath: path.join(OUTPUT_DIR, designId, RENDER_IMG),
    octopusFileName: 'octopus-v2.json', // TODO remove in the end when octopus2 is not needed
  }
}

async function getImages(designId: string): Promise<SourceImage[]> {
  const images = [] as SourceImage[]
  const imagesPath = path.join(OUTPUT_DIR, designId, IMAGES_DIR)
  try {
    const imagesResults = await readdir(imagesPath, { withFileTypes: true })
    for (const image of imagesResults) {
      if (image.isDirectory()) continue
      const name = image.name
      images.push({ name, path: path.join(IMAGES_DIR, name) })
    }
  } catch {
    console.info(`Reading image directory '${imagesPath}' was not successful`)
  }

  const patternsPath = path.join(OUTPUT_DIR, designId, IMAGES_DIR, PATTERNS_DIR)
  try {
    const patternsResults = await readdir(patternsPath, { withFileTypes: true })
    for (const image of patternsResults) {
      if (image.isDirectory()) continue
      const name = image.name
      const relativePath = path.join(IMAGES_DIR, PATTERNS_DIR, name)
      const imgPath = path.join(OUTPUT_DIR, designId, relativePath)
      const { width, height } = await sizeOf(imgPath)
      images.push({ name, path: relativePath, width, height })
    }
  } catch {
    console.info(`Reading image pattern directory '${patternsPath}' was not successful`)
  }

  return images
}

export async function prepareSourceDesign(
  octopusConverter: OctopusPSDConverter,
  filename: string,
  designId: string
): Promise<SourceDesign> {
  await parsePsd(filename, getParsePsdOptions(designId))
  const sourcePath = path.join(OUTPUT_DIR, designId, SOURCE_FILE)
  const file = await readFile(sourcePath, { encoding: 'utf8' })
  const artboard = JSON.parse(file)
  const images = await getImages(designId)
  return new SourceDesign({ designId, octopusConverter, artboard, images })
}
