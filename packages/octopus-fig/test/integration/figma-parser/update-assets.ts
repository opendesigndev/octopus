/** Updates Assets: Download the Source from FigmaApi and update tests */

import { getCommandLineArgs } from '../shared/utils/argv'
import { AssetUpdater } from './services/asset-updater'

async function updateTests() {
  const { selectedAsset } = getCommandLineArgs()
  const assetUpdater = new AssetUpdater({ selectedAsset })
  const N = await assetUpdater.update()

  console.info(`✅ SUCCESS: ${N} assets updated!\n`)
}

updateTests()
