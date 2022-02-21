import dotenv from 'dotenv'
import { execSync } from 'child_process'

dotenv.config()
;(function () {
  console.error('__starts')
  const renderPath = process.env.RENDERING_PATH
  const testFile = process.env.OCTOPUS_TEST_FILE

  const command = `${renderPath} ${testFile}`
  try {
    execSync(command)
  } catch (e) {
    console.error('Failed to render test file')
  }
})()
