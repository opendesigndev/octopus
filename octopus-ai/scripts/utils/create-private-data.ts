// @todo: not used yet. will consider creating one total script
// import dotenv from 'dotenv'
// import chalk from 'chalk'
// import path from 'path'

// import { getFileLocation } from './get-file-location.js'
// import { extractPrivateData } from '@avocode/ai-private-data-parser'
//import privateDataparser from 'node_modules/@avocode/ai-private-data-parser/dist/cli.js'
//const PRIVATE_DATA_PARSER = 'node_modules/@avocode/ai-private-data-parser/dist/cli.js'

// dotenv.config()

// export async function createPrivateData(): Promise<string> {
//   const fileLocation = getFileLocation()
//   const privateDataLocation = process.env.PRIVATE_DATA_LOCATION
//   const command = `node ${PRIVATE_DATA_PARSER} ${fileLocation} ${privateDataLocation}`
//   let privatedata
//   try {
//     privateData = extractPrivateData(fileLocation, privateDataLocation)
//   } catch (e) {
//     console.info(chalk.red(`Creating private data failed: "${command}"`))
//   }

//   return path.join(__dirname, '../../') + privateDataLocation
// }
