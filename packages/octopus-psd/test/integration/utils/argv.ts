export function getCommandLineArgs(): { selectedTest: string | undefined } {
  return { selectedTest: process.argv[2] }
}
