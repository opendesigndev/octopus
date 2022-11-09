import { AssetsReader } from './services/assets-reader'
import { TestUpdater } from './services/test-updater'
import { getCommandLineArgs } from './utils'

async function updateTests() {
  const { selectedTest } = getCommandLineArgs()
  const assetsReader = new AssetsReader({ selectedTest })
  const testUpdater = new TestUpdater(assetsReader)
  await testUpdater.update()
  console.log('Tests updated')
}

updateTests()
