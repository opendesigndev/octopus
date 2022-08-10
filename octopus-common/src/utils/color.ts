import { clamp, lerp, round } from './math.js'

import type { Octopus } from '../typings/octopus-common/index.js'

type Color = { r?: number; g?: number; b?: number; a?: number }

function lerpChannel(channel1 = 0, channel2 = 0, ratio: number, clampLeft = 0, clampRight = 255): number {
  return clamp(lerp(channel1, channel2, ratio), clampLeft, clampRight)
}

export function lerpColor(color1: Color, color2: Color, ratio: number): Octopus['Color'] {
  const { r: r1, g: g1, b: b1, a: a1 } = color1 ?? {}
  const { r: r2, g: g2, b: b2, a: a2 } = color2 ?? {}
  return {
    r: lerpChannel(r1, r2, ratio),
    g: lerpChannel(g1, g2, ratio),
    b: lerpChannel(b1, b2, ratio),
    a: lerpChannel(a1 ?? 1, a2 ?? 1, ratio, 0, 1),
  }
}

export function multiplyAlpha(color: Octopus['Color'], times = 1): Octopus['Color'] {
  const { r, g, b, a } = color
  return { r, g, b, a: round(a * times) }
}
