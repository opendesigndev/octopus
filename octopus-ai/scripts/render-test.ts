import { execSync } from 'child_process'
import dotenv from 'dotenv'

dotenv.config()
;(function () {
  const renderPath = process.env.RENDERING_PATH
  const testFile = process.env.OCTOPUS_TEST_FILE

  const command = `${renderPath} ${testFile}`
  try {
    execSync(command)
  } catch (e) {
    console.error('Failed to render test file')
  }
})()
