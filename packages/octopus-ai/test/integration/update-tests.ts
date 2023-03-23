import { AssetsReader } from './services/assets-reader.js'
import { TestUpdater } from './services/test-updater.js'
import { getCommandLineArgs } from './utils.js'

async function updateTests() {
  const { selectedTest } = getCommandLineArgs()
  const assetsReader = new AssetsReader({ selectedTest })
  const testUpdater = new TestUpdater(assetsReader)
  await testUpdater.update()
  console.info(`✅ SUCCESS: All tests updated!\n`)
}

updateTests()
