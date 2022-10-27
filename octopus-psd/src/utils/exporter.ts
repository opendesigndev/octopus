import kebabCase from 'lodash/kebabCase'

export const IMAGES_DIR_NAME = 'images'
export const IMAGE_EXTNAME = '.png'
export const MANIFEST_NAME = 'octopus-manifest.json'
export const SOURCE_NAME = 'source.json'

export function getOctopusFileName(id: string): string {
  return `octopus-${kebabCase(id)}.json`
}
