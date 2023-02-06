import { AssetReader } from '../common/services/asset-reader'
import { getCommandLineArgs } from '../common/utils/argv'
import { SOURCE_FILE_NAME } from './const'
import { TestUpdater } from './services/test-updater'

async function updateTests() {
  const { selectedAsset } = getCommandLineArgs()
  const assetReader = new AssetReader({ selectedAsset, testDirPath: __dirname, sourceFileName: SOURCE_FILE_NAME })
  const testDirectoryData = await assetReader.getTestsDirectoryData()

  const testUpdater = new TestUpdater(testDirectoryData)
  await testUpdater.update()
  console.info(`✅ SUCCESS: ${testDirectoryData.length} tests updated!\n`)
}

updateTests()
