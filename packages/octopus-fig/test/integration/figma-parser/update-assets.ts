/** Updates Assets: Download the Source from FigmaApi and update tests */

import { AssetUpdater } from './services/asset-updater.js'
import { getCommandLineArgs } from '../common/utils/argv.js'

async function updateTests() {
  const { selectedAsset } = getCommandLineArgs()
  const assetUpdater = new AssetUpdater({ selectedAsset })
  const sumUpdated = await assetUpdater.update()

  console.info(`✅ SUCCESS: ${sumUpdated} assets updated!\n`)
}

updateTests()
