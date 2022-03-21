/* eslint-disable @typescript-eslint/no-explicit-any */

type PsdResult = {
  parse: () => void
  tree: () => any
}

type PsdOpenResult = {
  image: any
}

declare module 'psd' {
  export function fromFile(psdPath: string): PsdResult
  export function open(psdPath: string): Promise<PsdOpenResult>
}
