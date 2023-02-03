import { SOURCE_FILE_NAME } from '.'
import { AssetReader } from '../shared/services/asset-reader'
import { getCommandLineArgs } from '../shared/utils/argv'
import { TestUpdater } from './services/test-updater'

async function updateTests() {
  const { selectedAsset } = getCommandLineArgs()
  const assetReader = new AssetReader({ selectedAsset, sourceFileName: SOURCE_FILE_NAME })
  const testDirectoryData = await assetReader.getTestsDirectoryData()

  const testUpdater = new TestUpdater(testDirectoryData)
  await testUpdater.update()
  console.info('✅ SUCCESS: Tests updated!\n')
}

updateTests()
