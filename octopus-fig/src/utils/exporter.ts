import kebabCase from 'lodash/kebabCase'

export const IMAGES_DIR_NAME = 'images'
export const IMAGE_EXTNAME = '.png'
export const MANIFEST_FILE_NAME = 'octopus-manifest.json'

export function getOctopusFileName(id: string): string {
  return `${kebabCase(id)}-octopus.json`
}

export function getPreviewFileName(id: string): string {
  return `${kebabCase(id)}-preview${IMAGE_EXTNAME}`
}

export function getSourceFileName(id: string): string {
  return `${kebabCase(id)}-source.json`
}
