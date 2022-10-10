/** Updates Assets: Download the Source from FigmaApi and update tests */

import { AssetUpdater } from './services/asset-updater'
import { getCommandLineArgs } from './utils/argv'

async function updateTests() {
  const { selectedAsset } = getCommandLineArgs()
  const assetUpdater = new AssetUpdater({ selectedAsset })
  await assetUpdater.update()

  console.info('SUCCESS: Assets updated!\n')
}

updateTests()
