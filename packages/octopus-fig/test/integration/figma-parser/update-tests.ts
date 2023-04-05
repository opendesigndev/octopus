import { SOURCE_FILE_NAME } from './const.js'
import { TestUpdater } from './services/test-updater.js'
import { AssetReader } from '../common/services/asset-reader.js'
import { getCommandLineArgs } from '../common/utils/argv.js'

async function updateTests() {
  const { selectedAsset } = getCommandLineArgs()
  const testDirPath = new URL('.', import.meta.url).pathname
  const assetReader = new AssetReader({ selectedAsset, testDirPath, sourceFileName: SOURCE_FILE_NAME })
  const testDirectoryData = await assetReader.getTestsDirectoryData()

  const testUpdater = new TestUpdater(testDirectoryData)
  await testUpdater.update()
  console.info(`✅ SUCCESS: ${testDirectoryData.length} tests updated!\n`)
}

updateTests()
