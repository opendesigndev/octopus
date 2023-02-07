import { AssetReader } from './services/asset-reader.js'
import { TestUpdater } from './services/test-updater.js'
import { getCommandLineArgs } from './utils/argv.js'

async function updateTests() {
  const { selectedTest } = getCommandLineArgs()
  const assetsReader = new AssetReader({ selectedTest })
  const testUpdater = new TestUpdater(assetsReader)
  await testUpdater.update()
  console.info(`✅ SUCCESS: All tests updated!\n`)
}

updateTests()
