import { execSync } from 'child_process'
import dotenv from 'dotenv'
import chalk from 'chalk'
import path from 'path'

const PRIVATE_DATA_PARSER = 'node_modules/@avocode/ai-private-data-parser/dist/cli.js'

dotenv.config();

export async function createPrivateData() {
    const [filename] = process.argv.slice(2)
    const fileLocation=`${process.env.ILLUSTRATOR_FILE_LOCATION_DIR}/${filename}`
    const privateDataLocation = process.env.PRIVATE_DATA_LOCATION

    const command = `node ${PRIVATE_DATA_PARSER} ${fileLocation} ${privateDataLocation}`
  
    try {
      execSync(command)
    } catch (e) {
      console.info(chalk.red(`Creating private data failed: "${command}"`))
    }

    return path.join(__dirname,'../../') + privateDataLocation
  }