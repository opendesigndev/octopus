import path from 'path'

const RELATIVE_PATH_TO_ROOT_DIR = '../../'

export function getFileLocation(): string {
  const [filename] = process.argv.slice(2)

  const pathToRootDir = path.join(__dirname, RELATIVE_PATH_TO_ROOT_DIR)
  const fileLocation = `${pathToRootDir}${process.env.ILLUSTRATOR_FILE_LOCATION_DIR}/${filename}`

  return fileLocation
}
