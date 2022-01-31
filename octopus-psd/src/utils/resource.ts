const IMAGE_PREFIX = 'pictures/'

export function convertImagePath(name: string) {
  return `${IMAGE_PREFIX}${name}`
}
