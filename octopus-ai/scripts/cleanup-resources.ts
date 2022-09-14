import fs from 'fs'
import path from 'path'

import dotenv from 'dotenv'

dotenv.config()

function cleanupResources() {
  const resourcesDir = process.env.RESOURCES_DIR

  if (!resourcesDir) {
    throw new Error('Missing resources dir')
  }

  const files = fs.readdirSync(resourcesDir)

  files.forEach((subpath) => {
    const assetPath = path.join(resourcesDir, subpath)
    if (fs.lstatSync(assetPath).isDirectory()) {
      fs.rmSync(assetPath, { recursive: true })
    } else {
      fs.unlinkSync(assetPath)
    }
  })
}

cleanupResources()
