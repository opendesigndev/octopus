/* eslint-disable @typescript-eslint/ban-types */
declare module '@avocode/psd-parser' {
  export function parsePsd(psdPath: string, options: object): Promise<{ octopusVersion: string }>
}
