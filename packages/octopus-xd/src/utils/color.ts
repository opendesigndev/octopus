import { asNumber } from '@opendesign/octopus-common/dist/utils/as.js'

import type { RawColor } from '../typings/source/index.js'

export function parseXDColor(color: RawColor | null | void): { r: number; g: number; b: number; a: number } {
  if (color?.mode !== 'RGB') {
    return {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    }
  }

  const [r, g, b] = [color?.value?.r, color?.value?.g, color?.value?.b].map((n) => asNumber(n, 0))

  const a = asNumber(color?.alpha, 1)

  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
    a,
  }
}
