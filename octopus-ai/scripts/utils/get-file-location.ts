export function getFileLocation(): string {
  const [filename] = process.argv.slice(2)
  const fileLocation = `${process.env.ILLUSTRATOR_FILE_LOCATION_DIR}/${filename}`

  return fileLocation
}
