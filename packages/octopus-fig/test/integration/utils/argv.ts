export function getCommandLineArgs(): { selectedAsset: string | undefined } {
  return { selectedAsset: process.argv[2] }
}
