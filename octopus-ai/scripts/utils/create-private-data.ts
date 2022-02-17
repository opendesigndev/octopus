//@todo: not used yet. will consider creating one total script
// import { execSync } from 'child_process'
// import dotenv from 'dotenv'
// import chalk from 'chalk'
// import path from 'path'
// import { getFileLocation } from './get-file-location'

// const PRIVATE_DATA_PARSER = 'node_modules/@avocode/ai-private-data-parser/dist/cli.js'

// dotenv.config()

// export async function createPrivateData(): Promise<string> {
//   const fileLocation = getFileLocation()
//   const privateDataLocation = process.env.PRIVATE_DATA_LOCATION
//   const command = `node ${PRIVATE_DATA_PARSER} ${fileLocation} ${privateDataLocation}`

//   try {
//     execSync(command)
//   } catch (e) {
//     console.info(chalk.red(`Creating private data failed: "${command}"`))
//   }

//   return path.join(__dirname, '../../') + privateDataLocation
// }
