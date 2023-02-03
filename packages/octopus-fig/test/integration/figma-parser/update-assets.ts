/** Updates Assets: Download the Source from FigmaApi and update tests */

import { getCommandLineArgs } from '../shared/utils/argv'
import { AssetUpdater } from './services/asset-updater'

async function updateTests() {
  const { selectedAsset } = getCommandLineArgs()
  const assetUpdater = new AssetUpdater({ selectedAsset })
  await assetUpdater.update()

  console.info('✅ SUCCESS: Assets updated!\n')
}

updateTests()
