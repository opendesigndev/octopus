import { AssetReader } from './services/asset-reader'
import { TestUpdater } from './services/test-updater'
import { getCommandLineArgs } from './utils/argv'

async function updateTests() {
  const { selectedAsset } = getCommandLineArgs()
  const assetReader = new AssetReader({ selectedAsset })
  const testDirectoryData = await assetReader.getTestsDirectoryData()

  const testUpdater = new TestUpdater(testDirectoryData)
  await testUpdater.update()
  console.info('SUCCESS: Tests updated!\n')
}

updateTests()
